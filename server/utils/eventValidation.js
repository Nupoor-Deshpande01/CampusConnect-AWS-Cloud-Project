const ALLOWED_CATEGORIES = [
  'Technical',
  'Cultural',
  'Sports',
  'Workshops',
  'Entrepreneurship'
];

const ALLOWED_STATUSES = [
  'draft',
  'published',
  'cancelled',
  'completed'
];

export const formatToMySQLDateTime = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  
  // Format as YYYY-MM-DD HH:mm:ss
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Validate input for creating or updating an event
 * @param {Object} data - Input payload
 * @param {boolean} isUpdate - If true, partial fields are allowed; if false, all required fields must be present
 * @returns {Array<string>} Array of error messages (empty if valid)
 */
export const validateEventPayload = (data, isUpdate = false) => {
  const errors = [];

  // 1. Title validation
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push('Event title is required and must be at least 3 characters.');
    } else if (data.title.trim().length > 255) {
      errors.push('Event title must not exceed 255 characters.');
    }
  }

  // 2. Description validation
  if (!isUpdate || data.description !== undefined) {
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
      errors.push('Event description is required and must be at least 10 characters.');
    }
  }

  // 3. Category validation
  if (!isUpdate || data.category !== undefined) {
    if (!data.category || !ALLOWED_CATEGORIES.includes(data.category)) {
      errors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`);
    }
  }

  // 4. Venue validation
  if (!isUpdate || data.venue !== undefined) {
    if (!data.venue || typeof data.venue !== 'string' || data.venue.trim().length < 2) {
      errors.push('Event venue is required and must be at least 2 characters.');
    } else if (data.venue.trim().length > 255) {
      errors.push('Event venue must not exceed 255 characters.');
    }
  }

  // 5. Capacity validation
  if (!isUpdate || data.capacity !== undefined) {
    const parsedCapacity = Number(data.capacity);
    if (isNaN(parsedCapacity) || !Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
      errors.push('Capacity must be a positive integer greater than 0.');
    } else if (parsedCapacity > 100000) {
      errors.push('Capacity must not exceed 100,000.');
    }
  }

  // 6. Dates validation
  let startDate = null;
  let endDate = null;
  let regDeadline = null;

  if (!isUpdate || data.start_datetime !== undefined) {
    if (!data.start_datetime) {
      errors.push('Start date and time is required.');
    } else {
      startDate = new Date(data.start_datetime);
      if (isNaN(startDate.getTime())) {
        errors.push('Start date and time must be a valid date.');
      }
    }
  }

  if (!isUpdate || data.end_datetime !== undefined) {
    if (!data.end_datetime) {
      errors.push('End date and time is required.');
    } else {
      endDate = new Date(data.end_datetime);
      if (isNaN(endDate.getTime())) {
        errors.push('End date and time must be a valid date.');
      }
    }
  }

  if (!isUpdate || data.registration_deadline !== undefined) {
    if (!data.registration_deadline) {
      errors.push('Registration deadline is required.');
    } else {
      regDeadline = new Date(data.registration_deadline);
      if (isNaN(regDeadline.getTime())) {
        errors.push('Registration deadline must be a valid date.');
      }
    }
  }

  // Chronological order validation
  if (startDate && endDate) {
    if (endDate <= startDate) {
      errors.push('End date and time must be strictly after the start date and time.');
    }
  }

  if (startDate && regDeadline) {
    if (regDeadline > startDate) {
      errors.push('Registration deadline must be on or before the event start date and time.');
    }
  }

  // 7. Status validation
  if (data.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(data.status)) {
      errors.push(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`);
    }
  }

  // 8. Poster URL validation
  if (data.poster_url !== undefined && data.poster_url !== null) {
    if (typeof data.poster_url === 'string' && data.poster_url.trim().length > 1024) {
      errors.push('Poster URL must not exceed 1024 characters.');
    }
  }

  return errors;
};

export { ALLOWED_CATEGORIES, ALLOWED_STATUSES };
