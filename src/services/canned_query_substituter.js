import { canned_queries } from './canned_queries.js';
import { IQueryInputParser } from './iquery_input_parser.js';

/**
 * Substitutes keywords with canned queries.
 *
 * This class doesn't account for recursive replacements, so substitution
 * 'replacement text' shouldn't contain substitution 'keys', as this would
 * likely produce undesired results.
 */
export class CannedQuerySubstitutor extends IQueryInputParser {
  constructor() {
    super();
    this.substitutions = canned_queries;
  }

  parse(query) {
    for (let key of Object.keys(this.substitutions)) {
      let regex = new RegExp(`\\b(${key})(?<!')(?!')\\b`);
      query = query.replace(regex, this.substitutions[key]);
    }
    return query;
  }
}
