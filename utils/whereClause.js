// base --> Order.find() , Product.find()
// bigQuery --> search=coder&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=199&limit=5

// req.query  --> 
// {
//     search:"coder",
//     page:2,
//     category:"shortsleeves",
//     rating:{gte: 4},
//     price: {lte : 999 , gte : 199},
//     limit : 4
// }

class WhereClause {

    constructor(baseURL, bigQuery) {
        this.baseURL = baseURL;
        this.bigQuery = bigQuery;
    }

    // for search page
    search() {

        // extract search word
        const searchWord = this.bigQuery.search ? {
            name: {
                $regex: this.bigQuery.search,
                $options: 'i',
            }
        } : {};

        // filter upon search word in base word
        this.baseURL = this.baseURL.find({ ...searchWord });

        return this;
    }

    // for page query 
    pager(resultPerPage) {
        let currentPage = 1;

        if (this.bigQuery.page) {
            currentPage = this.bigQuery.page;
        }

        // formula to skip no of records
        const skipRecords = resultPerPage * (currentPage - 1);

        // base url -->  limit - records per page , skip - no of records to skip
        this.baseURL = this.baseURL.limit(resultPerPage).skip(skipRecords);

        return this;
    }

    // filter query 
    filter() {

        let copyQuery = this.bigQuery;

        // delete all which are not needed - search , page , limit
        delete copyQuery["search"];
        delete copyQuery["limit"];
        delete copyQuery["page"];

        // covert to stirng to replace 
        let stringOfCopyQuery = JSON.stringify(copyQuery);

        // user regex to replace gte || lte || lt || gt --> $gte || $lte || $lt || $gt for db search
        stringOfCopyQuery = stringOfCopyQuery.replace(/\b(gte|lte|gt|lt)\b/g, (word) => `$${word}`);

        // convert string to json to search
        const jsonOfCopyQuery = JSON.parse(stringOfCopyQuery);

        // change base url
        this.baseURL = this.baseURL.find(jsonOfCopyQuery);

        return this;
    }
}


module.exports = WhereClause;