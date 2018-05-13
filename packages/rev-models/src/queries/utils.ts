import { escapeForRegex } from '../utils/index';

/**
 * @private
 */
export function isFieldValue(value: any) {
    return (typeof value == 'string'
        || typeof value == 'boolean'
        || (typeof value == 'number' && !isNaN(value))
        || (typeof value == 'object' && value instanceof Date)
        || value === null);
}

/**
 * @private
 */
export function getLikeOperatorRegExp(likeStr: string) {
    // Build a RegExp from string with % wildcards (i.e. LIKE in SQL)
    // Can't use a simple RegExp because JS doesn't support lookbehinds :(
    likeStr = escapeForRegex(likeStr);
    if (likeStr == '') {
        return /^.{0}$/m; // match only empty strings
    }
    let m: RegExpExecArray | null;
    // First, find instances of '%%' (which should match '%' in the data)
    let doubleMatcher = /%%/g;
    let doubleLocs: number[] = [];
    while(m = doubleMatcher.exec(likeStr)) {  // tslint:disable-line
        doubleLocs.push(m.index);
    }
    // Now find instances of single '%'s
    let singleMatcher = /%/g;
    let singleLocs: number[] = [];
    while(m = singleMatcher.exec(likeStr)) {  // tslint:disable-line
        if (doubleLocs.indexOf(m.index) == -1
            && doubleLocs.indexOf(m.index + 1) == -1
            && doubleLocs.indexOf(m.index - 1) == -1) {
            singleLocs.push(m.index);
        }
    }
    // Replace single '%'s with '.*'
    let wildcardedStr = '';
    let startLoc = 0;
    if (singleLocs.length > 0) {
        for (let singleLoc of singleLocs) {
            wildcardedStr += likeStr.slice(startLoc, singleLoc) + '.*';
            startLoc = singleLoc + 1;
        }
        wildcardedStr += likeStr.substr(startLoc);
    }
    else {
        wildcardedStr = likeStr;
    }
    wildcardedStr = wildcardedStr.replace(/%%/g, '%');
    return new RegExp('^' + wildcardedStr + '$', 'im');
}
