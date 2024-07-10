import React from 'react'

const CreateSlug = (text) => {
    return text
    .toString()                    // Convert to string (in case it isn't)
    .toLowerCase()                 // Convert to lowercase
    .trim()                        // Trim leading and trailing whitespace
    .replace(/&/g, '-and-')        // Replace & with '-and-'
    .replace(/[\s]+/g, '-')        // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')      // Remove all non-word characters except hyphens
    .replace(/\-\-+/g, '-');       // Replace multiple hyphens with a single hyphen
}

export default CreateSlug
