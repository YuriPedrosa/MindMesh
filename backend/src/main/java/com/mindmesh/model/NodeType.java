package com.mindmesh.model;

/**
 * Enumeration of possible types for mind map nodes.
 * Each type represents a different category of idea or concept in the mind map.
 *
 * @author Yuri Pedrosa
 */
public enum NodeType {
    /**
     * Represents a general idea or concept.
     */
    IDEA,

    /**
     * Represents a simple note or annotation.
     */
    NOTE,

    /**
     * Represents an actionable task or to-do item.
     */
    TASK,

    /**
     * Represents a question or inquiry.
     */
    QUESTION,

    /**
     * Represents a decision point or choice.
     */
    DECISION,

    /**
     * Represents a reference to external information or resource.
     */
    REFERENCE
}
