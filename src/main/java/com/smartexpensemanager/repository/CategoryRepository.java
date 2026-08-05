package com.smartexpensemanager.repository;

import com.smartexpensemanager.entity.Category;
import com.smartexpensemanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUser(User user);
    List<Category> findByUserAndType(User user, String type);
    Optional<Category> findByUserAndName(User user, String name);

    @Query("SELECT c FROM Category c WHERE c.isDefault = true OR c.user.id = :userId")
    List<Category> findByIsDefaultTrueOrUserId(@Param("userId") Long userId);
}
