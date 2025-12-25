package com.tzavrishon.repository;

import com.tzavrishon.domain.GuestIdentity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestIdentityRepository extends JpaRepository<GuestIdentity, UUID> {}

