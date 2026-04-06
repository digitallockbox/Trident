/**
 * Paragon — Quality Standards Engine
 *
 * Validates data quality, enforces schema compliance,
 * and grades entities against defined quality criteria.
 */
export class Paragon {
  private schemas: Map<string, Record<string, { type: string; required?: boolean; min?: number; max?: number; pattern?: string }>> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'validate';

    switch (action) {
      case 'defineSchema':
        return this.defineSchema(data);
      case 'validate':
        return this.validate(data);
      case 'grade':
        return this.grade(data);
      case 'schemas':
        return this.listSchemas();
      default:
        return { status: 'error', engine: 'Paragon', error: `Unknown action: ${action}` };
    }
  }

  private defineSchema(data: Record<string, any>): Record<string, any> {
    const name = data.name as string;
    const fields = data.fields as Record<string, any>;
    if (!name || !fields) {
      return { status: 'error', engine: 'Paragon', error: 'Missing schema name or fields' };
    }
    this.schemas.set(name, fields);
    return { status: 'success', engine: 'Paragon', schema: name, fields: Object.keys(fields) };
  }

  private validate(data: Record<string, any>): Record<string, any> {
    const schema = data.schema as string;
    const record = data.record as Record<string, any>;
    if (!schema || !record) {
      return { status: 'error', engine: 'Paragon', error: 'Missing schema or record' };
    }

    const schemaDef = this.schemas.get(schema);
    if (!schemaDef) {
      return { status: 'error', engine: 'Paragon', error: `Schema '${schema}' not found` };
    }

    const errors: Array<{ field: string; error: string }> = [];

    for (const [field, rules] of Object.entries(schemaDef)) {
      const value = record[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, error: 'required' });
        continue;
      }
      if (value === undefined || value === null) continue;

      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push({ field, error: `expected string, got ${typeof value}` });
      }
      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push({ field, error: `expected number, got ${typeof value}` });
      }
      if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push({ field, error: `expected boolean, got ${typeof value}` });
      }
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push({ field, error: `below minimum ${rules.min}` });
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push({ field, error: `above maximum ${rules.max}` });
        }
      }
      if (typeof value === 'string' && rules.pattern) {
        try {
          if (!new RegExp(rules.pattern).test(value)) {
            errors.push({ field, error: `does not match pattern` });
          }
        } catch {
          // Invalid pattern in schema — skip
        }
      }
    }

    return {
      status: 'success',
      engine: 'Paragon',
      valid: errors.length === 0,
      errors,
      schema,
    };
  }

  private grade(data: Record<string, any>): Record<string, any> {
    const records = Array.isArray(data.records) ? data.records : [];
    const schema = data.schema as string;
    const schemaDef = this.schemas.get(schema);

    if (!schemaDef || records.length === 0) {
      return { status: 'error', engine: 'Paragon', error: 'Missing schema or records' };
    }

    let validCount = 0;
    const fieldErrors: Record<string, number> = {};

    for (const record of records) {
      let isValid = true;
      for (const [field, rules] of Object.entries(schemaDef)) {
        const value = record[field];
        if (rules.required && (value === undefined || value === null || value === '')) {
          isValid = false;
          fieldErrors[field] = (fieldErrors[field] || 0) + 1;
        }
      }
      if (isValid) validCount++;
    }

    const qualityScore = Math.round((validCount / records.length) * 10000) / 100;
    let grade: string;
    if (qualityScore >= 95) grade = 'A';
    else if (qualityScore >= 85) grade = 'B';
    else if (qualityScore >= 70) grade = 'C';
    else if (qualityScore >= 50) grade = 'D';
    else grade = 'F';

    return {
      status: 'success',
      engine: 'Paragon',
      totalRecords: records.length,
      validRecords: validCount,
      qualityScore,
      grade,
      fieldErrors,
    };
  }

  private listSchemas(): Record<string, any> {
    const schemas: Record<string, string[]> = {};
    for (const [name, def] of this.schemas.entries()) {
      schemas[name] = Object.keys(def);
    }
    return { status: 'success', engine: 'Paragon', schemas, total: this.schemas.size };
  }
}
