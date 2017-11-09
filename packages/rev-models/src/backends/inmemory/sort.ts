
export function sortRecords(records: object[], order_by: string[]) {
    return records.sort((r1, r2) => {
        for (let order_spec of order_by) {
            let tokens = order_spec.split(' ');
            let val1 = (typeof r1[tokens[0]] == 'string') ?
                r1[tokens[0]].toLowerCase() : r1[tokens[0]];
            let val2 = (typeof r2[tokens[0]] == 'string') ?
                r2[tokens[0]].toLowerCase() : r2[tokens[0]];
            if (val1 != val2) {
                if (tokens[1] == 'desc') {
                    return (val1 > val2) ? -1 : 1;
                }
                else {
                    return (val1 < val2) ? -1 : 1;
                }
            }
        }
        return 0;
    });
}
