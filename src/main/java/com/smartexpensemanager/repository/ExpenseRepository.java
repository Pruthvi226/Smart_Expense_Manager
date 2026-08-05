package com.smartexpensemanager.repository;

import com.smartexpensemanager.entity.Expense;
import com.smartexpensemanager.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {
    
    Page<Expense> findByUser(User user, Pageable pageable);

    List<Expense> findByUserAndExpenseDateBetween(User user, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserAndCategoryAndExpenseDateBetween(User user, String category, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalByUserAndExpenseDateBetween(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.category = :category AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalByUserAndCategoryAndExpenseDateBetween(@Param("user") User user, @Param("category") String category, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.expenseDate BETWEEN :startDate AND :endDate GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> findCategoryExpensesSummary(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e.expenseDate, SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.expenseDate BETWEEN :startDate AND :endDate GROUP BY e.expenseDate ORDER BY e.expenseDate ASC")
    List<Object[]> findDailySpendingSummary(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<Expense> findTop5ByUserOrderByExpenseDateDescCreatedAtDesc(User user);
}
