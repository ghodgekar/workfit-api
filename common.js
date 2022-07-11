const getLimitSort= function (req, id){
    let limit = req.limit ? ' LIMIT ' + req.limit : '';
    let sort = limit+'';
    if (req.sort) {
        if (req.sort == 'asc' || req.sort == 'ASC') {
            sort = req.sort ? ` ORDER BY ${id} ASC ` : '';
        } else if (req.sort == 'desc' || req.sort == 'DESC') {
            sort = req.sort ? ` ORDER BY ${id} DESC ` : '';
        }
    }
    return sort
}