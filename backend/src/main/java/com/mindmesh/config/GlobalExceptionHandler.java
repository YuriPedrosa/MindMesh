package com.mindmesh.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the MindMesh application.
 * Provides centralized error handling for REST controllers.
 * Converts exceptions into appropriate HTTP responses with error details.
 *
 * @author Yuri Pedrosa
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles validation exceptions from request body validation.
     * Extracts field errors and returns them in a structured format.
     *
     * @param ex the validation exception
     * @return HTTP 400 with field-specific error messages
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        logger.warn("Validation error: {}", errors);
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Handles illegal argument exceptions, typically from invalid input data.
     *
     * @param ex the illegal argument exception
     * @return HTTP 400 with error message
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        logger.error("Illegal argument: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Handles any unhandled exceptions as a fallback.
     * Logs the full stack trace for debugging purposes.
     *
     * @param ex the general exception
     * @return HTTP 500 with generic error message
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        logger.error("Unexpected error: {}", ex.getMessage(), ex);
        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal server error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
