/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save(){
    
    if (this.id === undefined) {
      const resp = await db.query(`
      INSERT INTO reservations (customer_id, start_at, num_guests, notes) 
    VALUES ($1, $2, $3, $4)
    RETURNING id, customer_id, start_at, num_guests, notes
      `,
      [this.customerId, this.startAt, this.numGuests, this.notes]
      );
      //id isnt created yet so once you create reservation, set the id to this one 
      this.id = resp.rows[0].id
    }
    await db.query(
      `UPDATE reservations SET 
      customer_id=$1, start_at=$2, num_guests=$3, notes=$4 
      WHERE id = $5 RETURNING  customer_id, start_at, num_guests, notes, id 
      `, 
      [this.customerId, this.startAt, this.numGuests, this.notes, this.id]
    )
    if (this.customerId === undefined) {
      const err = new Error(`no customer id of ${this.customerId} exsists :(`)
      err.status = 400;
      throw err;
     }
  }
  }
  



module.exports = Reservation;
