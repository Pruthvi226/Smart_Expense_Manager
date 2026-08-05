package com.smartexpensemanager.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.dto.response.*;
import com.smartexpensemanager.entity.Expense;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.exception.ResourceNotFoundException;
import com.smartexpensemanager.repository.ExpenseRepository;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.service.AiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiServiceImpl implements AiService {

    public AiServiceImpl(UserRepository userRepository, ExpenseRepository expenseRepository) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
    }

    private static final Logger log = LoggerFactory.getLogger(AiServiceImpl.class);

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    @Value("${app.openai.api-key:}")
    private String openAiApiKey;

    private static final Map<String, String> MERCHANT_CATEGORY_MAP = Map.ofEntries(
            Map.entry("swiggy", "Food"),
            Map.entry("zomato", "Food"),
            Map.entry("starbucks", "Food"),
            Map.entry("mcdonalds", "Food"),
            Map.entry("uber", "Transport"),
            Map.entry("ola", "Transport"),
            Map.entry("rapido", "Transport"),
            Map.entry("shell", "Transport"),
            Map.entry("petrol", "Transport"),
            Map.entry("netflix", "Entertainment"),
            Map.entry("spotify", "Entertainment"),
            Map.entry("amazon prime", "Entertainment"),
            Map.entry("cinema", "Entertainment"),
            Map.entry("pvr", "Entertainment"),
            Map.entry("amazon", "Shopping"),
            Map.entry("flipkart", "Shopping"),
            Map.entry("myntra", "Shopping"),
            Map.entry("zara", "Shopping"),
            Map.entry("electricity", "Utilities"),
            Map.entry("broadband", "Utilities"),
            Map.entry("water bill", "Utilities"),
            Map.entry("rent", "Housing"),
            Map.entry("pharmacy", "Healthcare"),
            Map.entry("hospital", "Healthcare"),
            Map.entry("doctor", "Healthcare")
    );

    @Override
    public AiCategorizationResponse categorizeExpense(String merchantOrTitle) {
        if (merchantOrTitle == null || merchantOrTitle.isBlank()) {
            return new AiCategorizationResponse(merchantOrTitle, "General", 0.5);
        }

        String cleaned = merchantOrTitle.trim().toLowerCase();
        for (Map.Entry<String, String> entry : MERCHANT_CATEGORY_MAP.entrySet()) {
            if (cleaned.contains(entry.getKey())) {
                return new AiCategorizationResponse(merchantOrTitle, entry.getValue(), 0.95);
            }
        }

        return new AiCategorizationResponse(merchantOrTitle, "Other", 0.60);
    }

    @Override
    @Transactional(readOnly = true)
    public AiQueryResponse processNaturalLanguageQuery(Long userId, String queryText) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (queryText == null || queryText.isBlank()) {
            return new AiQueryResponse(queryText, "Please enter a question.", null, 0.0, Collections.emptyList());
        }

        String lower = queryText.toLowerCase();
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        // Scenario 1: "largest expense" or "biggest expense"
        if (lower.contains("largest") || lower.contains("biggest") || lower.contains("highest")) {
            List<Expense> expenses = expenseRepository.findByUserAndExpenseDateBetween(user, startOfMonth, endOfMonth);
            Optional<Expense> maxOpt = expenses.stream().max(Comparator.comparing(Expense::getAmount));
            if (maxOpt.isPresent()) {
                Expense max = maxOpt.get();
                String ans = String.format("Your largest expense this month is '%s' of ₹%.2f in category '%s' on %s.",
                        max.getTitle(), max.getAmount(), max.getCategory(), max.getExpenseDate());
                return new AiQueryResponse(queryText, ans, max.getCategory(), max.getAmount().doubleValue(), List.of(mapToResponse(max)));
            } else {
                return new AiQueryResponse(queryText, "You have no expenses recorded for this month.", null, 0.0, Collections.emptyList());
            }
        }

        // Scenario 2: Category specific queries ("How much did I spend on food this month?")
        String categoryFound = null;
        for (String cat : List.of("Food", "Transport", "Entertainment", "Shopping", "Utilities", "Healthcare", "Housing")) {
            if (lower.contains(cat.toLowerCase())) {
                categoryFound = cat;
                break;
            }
        }

        // Check month name (e.g., "july", "august")
        Month targetMonth = now.getMonth();
        for (Month m : Month.values()) {
            if (lower.contains(m.name().toLowerCase())) {
                targetMonth = m;
                break;
            }
        }

        LocalDate qStart = LocalDate.of(now.getYear(), targetMonth, 1);
        LocalDate qEnd = qStart.withDayOfMonth(qStart.lengthOfMonth());

        if (categoryFound != null) {
            List<Expense> catExpenses = expenseRepository.findByUserAndCategoryAndExpenseDateBetween(user, categoryFound, qStart, qEnd);
            BigDecimal total = catExpenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            String ans = String.format("You spent ₹%.2f on %s in %s.", total, categoryFound, targetMonth.name());
            List<ExpenseResponse> matches = catExpenses.stream().map(this::mapToResponse).collect(Collectors.toList());
            return new AiQueryResponse(queryText, ans, categoryFound, total.doubleValue(), matches);
        }

        // Scenario 3: General monthly query
        List<Expense> monthExpenses = expenseRepository.findByUserAndExpenseDateBetween(user, qStart, qEnd);
        BigDecimal total = monthExpenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        String ans = String.format("Your total expenses for %s are ₹%.2f across %d transactions.", targetMonth.name(), total, monthExpenses.size());
        return new AiQueryResponse(queryText, ans, "All", total.doubleValue(), monthExpenses.stream().map(this::mapToResponse).limit(10).collect(Collectors.toList()));
    }

    @Override
    @Transactional(readOnly = true)
    public AiSummaryResponse generateSpendingSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LocalDate now = LocalDate.now();
        LocalDate currStart = now.withDayOfMonth(1);
        LocalDate currEnd = now.withDayOfMonth(now.lengthOfMonth());

        LocalDate prevStart = currStart.minusMonths(1);
        LocalDate prevEnd = currStart.minusDays(1);

        BigDecimal currTotal = expenseRepository.sumTotalByUserAndExpenseDateBetween(user, currStart, currEnd);
        if (currTotal == null) currTotal = BigDecimal.ZERO;

        BigDecimal prevTotal = expenseRepository.sumTotalByUserAndExpenseDateBetween(user, prevStart, prevEnd);
        if (prevTotal == null) prevTotal = BigDecimal.ZERO;

        double overallGrowth = 0.0;
        if (prevTotal.compareTo(BigDecimal.ZERO) > 0) {
            overallGrowth = currTotal.subtract(prevTotal).divide(prevTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        String execSummary = String.format("Your total spending for this month is ₹%.2f. Overall expenses changed by %.1f%% compared to last month.", currTotal, overallGrowth);

        List<String> keyInsights = new ArrayList<>();
        keyInsights.add(String.format("Current month total: ₹%.2f", currTotal));
        keyInsights.add(String.format("Previous month total: ₹%.2f", prevTotal));

        // Category breakdown comparisons
        List<Object[]> currCatSummary = expenseRepository.findCategoryExpensesSummary(user, currStart, currEnd);
        List<Object[]> prevCatSummary = expenseRepository.findCategoryExpensesSummary(user, prevStart, prevEnd);

        Map<String, BigDecimal> currMap = new HashMap<>();
        for (Object[] row : currCatSummary) currMap.put((String) row[0], (BigDecimal) row[1]);

        Map<String, BigDecimal> prevMap = new HashMap<>();
        for (Object[] row : prevCatSummary) prevMap.put((String) row[0], (BigDecimal) row[1]);

        List<String> budgetAlerts = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        for (Map.Entry<String, BigDecimal> entry : currMap.entrySet()) {
            String cat = entry.getKey();
            BigDecimal currVal = entry.getValue();
            BigDecimal prevVal = prevMap.getOrDefault(cat, BigDecimal.ZERO);

            if (prevVal.compareTo(BigDecimal.ZERO) > 0) {
                double pct = currVal.subtract(prevVal).divide(prevVal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
                if (pct > 20.0) {
                    budgetAlerts.add(String.format("You spent %.1f%% more on %s compared to last month (₹%.2f vs ₹%.2f).", pct, cat, currVal, prevVal));
                    recommendations.add(String.format("Consider reviewing discretionary purchases in %s.", cat));
                } else if (pct < -10.0) {
                    keyInsights.add(String.format("%s spending decreased by %.1f%%.", cat, Math.abs(pct)));
                }
            }
        }

        if (budgetAlerts.isEmpty()) {
            budgetAlerts.add("All category spending levels are currently within typical thresholds.");
        }
        if (recommendations.isEmpty()) {
            recommendations.add("Keep up your current spending discipline to meet your financial goals.");
        }

        return AiSummaryResponse.builder()
                .executiveSummary(execSummary)
                .keyInsights(keyInsights)
                .budgetAlerts(budgetAlerts)
                .recommendations(recommendations)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AiBudgetSuggestionResponse generateBudgetSuggestions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LocalDate now = LocalDate.now();
        LocalDate currStart = now.withDayOfMonth(1);
        LocalDate currEnd = now.withDayOfMonth(now.lengthOfMonth());

        List<Object[]> catSummary = expenseRepository.findCategoryExpensesSummary(user, currStart, currEnd);
        List<AiBudgetSuggestionResponse.SuggestionItem> suggestions = new ArrayList<>();
        BigDecimal totalPotentialSavings = BigDecimal.ZERO;

        for (Object[] row : catSummary) {
            String cat = (String) row[0];
            BigDecimal currentSpending = (BigDecimal) row[1];

            // Recommend a 15% reduction on high-spending categories (Food, Entertainment, Shopping)
            if (Set.of("Food", "Entertainment", "Shopping").contains(cat)) {
                BigDecimal suggestedLimit = currentSpending.multiply(BigDecimal.valueOf(0.85)).setScale(2, RoundingMode.HALF_UP);
                BigDecimal potentialSavings = currentSpending.subtract(suggestedLimit);
                totalPotentialSavings = totalPotentialSavings.add(potentialSavings);

                suggestions.add(new AiBudgetSuggestionResponse.SuggestionItem(
                        cat,
                        currentSpending,
                        suggestedLimit,
                        potentialSavings,
                        String.format("Reduce %s spending by ₹%.2f to achieve your monthly savings target.", cat, potentialSavings)
                ));
            }
        }

        return AiBudgetSuggestionResponse.builder()
                .targetMonthlySavings(totalPotentialSavings)
                .suggestions(suggestions)
                .build();
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .userId(expense.getUser().getId())
                .version(expense.getVersion())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
