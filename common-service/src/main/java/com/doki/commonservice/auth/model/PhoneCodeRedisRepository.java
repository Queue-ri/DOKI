package com.doki.commonservice.auth.model;

import org.springframework.data.repository.CrudRepository;

/**
 * @author Queue-ri
 */

public interface PhoneCodeRedisRepository extends CrudRepository<RedisPhoneValidationCode, String> {
}
