import { CannedQuerySubstitutor } from './canned_query_substituter.js';
import { IQueryInputParser } from './iquery_input_parser.js';
import dipkg from 'dependency-injection-es6';
const {container} = dipkg;

container.bind(IQueryInputParser, CannedQuerySubstitutor);
export const query_input_parser = container.getInstanceOf(IQueryInputParser); 
