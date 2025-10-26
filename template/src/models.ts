import { PG_Table, PG_App , PG_AuthTable , PG_Ledger } from "pg-norm";
import {app} from "./db.js";





class ProductsTable extends PG_Table {
    

    constructor(pg_app: PG_App) {

        //       app  , table_name ,        visible columns
        super( pg_app , 'products' ,  ['name', 'price', 'category']  );

        // the code above sets the properies visibles , table_name for you

        /* visible columns are visible to insert(), update(), list(), fetch() methods
         *  you get those methods by default for basic CRUD operations
        **/

        // changing the maximum data this.list() can fetch
        // this.max_rows_fetched = 50; /*(this is the default)*/

    }


    /*  this is used to create the actual up to date SQL table for your app in new
     *  instances of the database.
     *
     *  NOTE:
     *    always keep this up to date with your schema so you can make new database instances
     *    for your app.
    **/
    public async create() {

        // it is very important to create column named id
        await this.sql`
        CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            category VARCHAR(50),
            in_stock BOOLEAN DEFAULT true
        )
        `;
    }


    /* this is what you use to bring your current database instance up to date
     *  with the latest changes you want to make to your schema
    **/
    public async alter(){
        // your code goes here
        // if you don't have any changes to the schema remove this method for now
    }


    // write your own methods to custom queries per your need
    // override list(), fetch(), insert(), update() methods to change their behavoir 
    // note that all of those are async methods

    /*  when you define your own methods you can use this.visibles and this.table_name
        for consistency, compatibilty and better security  */
}


// register table for cli commands support
export const products = new ProductsTable(app);
app.register( products );


/**
 *  import products now and use the following methods for basic CRUD
 *  
 *  await products.listAll()            // list all the rows of the table                  (only displays data in visible columns)
 *  await products.fetch( 1 )           // fetch visible columns for user with id 1        (only displays data in visible columns)
 *  await products.list( 50 , 2 )       // list second 50 rows of the table                (only displays data in visible columns
 *                                                                                          and cannot fetch more than max_rows_fetched
 *                                                                                          rows but as you can change it above in the
 *                                                                                          constructor of the table)
 *
 *  await products.update( 1 , {...} )  // change columns data for user with id 1          (only applies to data in visible columns) 
 *  
 *  await products.insert( {...} )      // insert a new rows and fill the column with data (only lets you insert visible columns, 
 *                                                                                          but if PG_AuthTable is used you can fill a
 *                                                                                          password field)
 *
 *  await products.delete( 1 )          // delete user with id 1
 *
**/





class UsersTable extends PG_AuthTable {
    constructor(pg_app: PG_App) {

        //      app  , table_name ,  visible columns     ,  identify user by
        super( pg_app, 'users', ['name', 'email', 'age'] ,      "email"       );

        // the code above sets the properies visibles , table_name and identify_user_by for you

        /*  identify_user_by field is anything you use to login, it can be email, phone_number 
            SSN, or the username. 

            the default value for identify_user_by if the feild was left empty in super() above */

    }

    public async create() {

        // it is very important to create column named id
        await this.sql`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            age INTEGER,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
        `;
    }

    /*  write your own methods to custom queries per your need
     *  override list(), fetch(), insert(), update() methods to change their behavoir 
     *  note that all of those are async methods
    */

    /*  when you define your own methods you can use this.visibles, this.table_name and this.identify_user_by
        for consistency, compatibilty and better security  */
}



// register table for cli commands support
const users = new UsersTable(app);
app.register(users);

/**
 *   now you can import users and use all the methods that can be used PG_Table are available in PG_AuthTable
 *   with some notes:
 *   
 *      1. you need to create a field called `password_hash` and the user identifying field you specified 
 *          in "identify user by" field (in this case the field call "username" so you need to create a
 *           field called username) as shown in create().
 *  
 *      2. when you insert rows you can fill a field called `password` (insert will hash it for you but don't 
 *                                                                    create this column in database)
 *
 *      3. update() cannot update passwords (unless you change it to do it which is very discouraged)
 *      4. to update password you use updatePassword( id , new_plaintext_password ) method
 *      5. to verify passwords you can use verifyPassword( id , plaintext_password )
 *
 * 
 * 
 *   in conclusion you have 3 methods extra methods (one overwritten):
 * 
 *      await products.insert( {...} );    // insert a new rows and fill the column with data (only lets you insert visible columns, 
 *                                                                                             but with additional "password" field that
 *                                                                                             will be hashed and added for you)
 *
 *      await updatePassword( 1 , "pass123" );    // update password to "pass123" of user with id 1
 *
 *      await verifyPassword( "ali@email.com" , "pass123" );   // verify the password of the user identified with "ali@email.com" and
 *                                                                check if it equals "pass123" 
 *
**/





class TransactionLedger extends PG_Ledger {

    constructor(pg_app: PG_App) {

        //       app  ,   table_name   ,                  visible columns
        super( pg_app , 'transactions' , ['from_account', 'to_account', 'amount', 'type']);

    }

    // beware that the name of the create function is different here
    public async createTable() {
        await this.sql`
        CREATE TABLE transactions (
            id SERIAL PRIMARY KEY,
            from_account INTEGER NOT NULL,
            to_account INTEGER NOT NULL,
            amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
            type VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
        `;
    }

}



// register table for cli commands support
const transactions = new TransactionLedger(app);
app.register(transactions);


/* ✅ Allowed methods (doumented above)

await transactions.insert({ from_account: 1, to_account: 2, amount: 100, type: 'transfer' });
await transactions.listAll();
await transactions.list( 50 , 2 );
await transactions.fetch( 1 );


❌  Throws error: ledgers are immutable

    await ledger.update(1, { amount: 200 });
    await ledger.delete(1);
*/





/**
 *  for CLI commands
 * 
 *     npm run db:create    # call .create() in all tables
 * 
 *     npm run db:alter     # call .alter() in all tables
 * 
 */

