import {Injectable} from "@angular/core";
import { Events } from 'ionic-angular';

const DB_NAME: string = '__agribridgeDb';
const win: any = window;

/** It is used for to execute database related functionality */
@Injectable()
export class Sql {
    private _db: any;

    constructor(public events?: Events) {
        if (win.sqlitePlugin) {
            this._db = win.sqlitePlugin.openDatabase({
                name: DB_NAME,
                location: 2,
                createFromLocation: 0
            });
        } else {
            console.warn('Storage: SQLite plugin not installed, falling back to WebSQL. Make sure to install cordova-sqlite-storage in production!');

            this._db = win.openDatabase(DB_NAME, '1.0', 'database', 5 * 1024 * 1024);
        }
        this.createTables();
    }

    // Initialize the DB with our required tables
    createTables() {

        this.query(`CREATE TABLE IF NOT EXISTS tbl_crops (
            id INTEGER PRIMARY KEY,
            name text
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_crops', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_varieties (
            id INTEGER PRIMARY KEY,
            crop_id INTEGER,
            name text
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_varieties', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_delete (
            id INTEGER PRIMARY KEY,
            server_id INTEGER,
            tablename text
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_error', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_errors (
            id INTEGER PRIMARY KEY,
            local_id INTEGER,
            tablename text,
            error_code text,
            error_message text
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_error', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_state (
            id INTEGER PRIMARY KEY,
            name text
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_state', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_district (
            id INTEGER PRIMARY KEY,
            state_id INTERGER,
            name text
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_district', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_taluka (
            id INTEGER PRIMARY KEY,
            district_id INTERGER,
            name text
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_taluka', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_village (
            id INTEGER PRIMARY KEY,
            taluka_id INTERGER,
            name text
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_village', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_farmers (
            fm_caid INTEGER,
            fm_id INTEGER,
            fm_fname text,
            fm_mname text,
            fm_lname text,
            fm_aadhar text,
            fm_mobileno text,
            fm_status INTEGER,
            fm_createddt INTEGER,
            fm_createdby text,
            fm_modifieddt INTEGER,
            fm_modifiedby text,

            local_id INTEGER PRIMARY KEY,
            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_farmers tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_personal_detail (
            fm_caid INTEGER,
            fm_id INTEGER,
            f1_mfname text,
            f1_mmname text,
            f1_dob text,
            f1_age INTEGER, 
            f1_mobno text,
            f1_altno text,
            any_other_select text,
            f1_ppno text, 
            f1_pancard text, 
            f1_vote text, 
            f1_licno text, 
            f1_otherno text, 
            f1_expfarm INTEGER,
            f1_status INTEGER,
            f1_created_date text,
            f1_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_personal_detail tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_residence_details (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f7_resistatus TEXT,
            f7_phouse TEXT,
            f7_pstreet TEXT,
            f7_parea TEXT,
            f7_pstate TEXT,
            f7_pdistrict TEXT,
            f7_ptaluka TEXT,
            f7_pvillage TEXT,
            f7_ppin TEXT,
            f7_chouse TEXT,
            f7_cstreet TEXT,
            f7_carea TEXT,
            f7_cstate TEXT,
            f7_cdistrict TEXT,
            f7_ctaluka TEXT,
            f7_cvillage TEXT,
            f7_cpin TEXT,

            f7_status INTEGER,
            f7_created_date text,
            f7_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_residence_details tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_applicant_knowledge (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f2_edudetail TEXT,
            f2_proficiency TEXT,
            f2_participation TEXT,
            f2_typeprog TEXT,
            f2_date TEXT,
            f2_durprog TEXT,
            f2_condprog TEXT,
            f2_cropprog TEXT,
            f2_pname TEXT,

            f2_status INTEGER,
            f2_created_date text,
            f2_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_applicant_knowledge tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_spouse_knowledge (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f4_edudetail TEXT,
            f4_proficiency TEXT,
            f4_participation TEXT,
            f4_typeprog TEXT,
            f4_date TEXT,
            f4_durprog TEXT,
            f4_condprog TEXT,
            f4_cropprog TEXT,
            f4_pname TEXT,

            f4_status INTEGER,
            f4_created_date text,
            f4_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_spouse_knowledge tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_applicant_phone (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f5_phonetype TEXT,
            f5_servpro TEXT,
            f5_network TEXT,
            f5_datapack TEXT,
            f5_datapackname TEXT,
            f5_appuse TEXT,
            f5_farmapp TEXT,

            f5_status INTEGER,
            f5_created_date text,
            f5_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_applicant_phone tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_family_details (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f6_points TEXT,
            f6_jointfamily TEXT,
            f6_members TEXT,
            f6_children TEXT,
            f6_smartuse TEXT,

            f6_status INTEGER,
            f6_created_date text,
            f6_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_family_details tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_appliances_details (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f7_television,
            f7_refrigerator,
            f7_wmachine,
            f7_mixer,
            f7_stove,
            f7_bicycle,
            f7_ccylinder,
            f7_fans,
            f7_motorcycle,
            f7_car,

            f7_status INTEGER,
            f7_created_date text,
            f7_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_appliances_details tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_spouse_details (
            fm_caid INTEGER,
            fm_id INTEGER,

            f3_married_status TEXT,
            f3_spouse_fname TEXT,
            f3_spouse_mname TEXT,
            f3_spouse_lname TEXT,
            f3_spouse_age TEXT,
            f3_spouse_mobno TEXT,
            f3_spouse_adhno TEXT,
            f3_loan_interest TEXT,
            f3_loan_tenure TEXT,
            f3_loan_emi TEXT,
            f3_spouse_shg TEXT,
            f3_spouse_income TEXT,
            f3_spouse_shgname TEXT,
            f3_spouse_occp TEXT,
            f3_spouse_mfi TEXT,
            f3_loan_purpose TEXT,
            f3_spouse_mfiname TEXT,
            f3_spouse_mfiamount TEXT,

            f3_status INTEGER,
            f3_created_date text,
            f3_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_spouse_details tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_land_details (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f9_name TEXT,
            f9_land_size TEXT,
            f9_owner TEXT,
            f9_lease_year TEXT,
            f9_amount_on_rent TEXT,
            f9_contract_year TEXT,
            f9_state TEXT,
            f9_district TEXT,
            f9_taluka TEXT,
            f9_vilage TEXT,
            f9_survey_number TEXT,
            f9_pincode TEXT,
            f9_soil_type TEXT,
            f9_soil_tested TEXT,

            f9_status INTEGER,
            f9_created_date text,
            f9_modified_date text,

            local_id INTEGER PRIMARY KEY,
            server_id text,
            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_land_details tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_asset_details (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f12_vehicle TEXT,
            f12_machinery TEXT,
            f12_any_other_assets TEXT,
            f12_name_of_other_assets TEXT,
            
            f12_status INTEGER,
            f12_created_date text,
            f12_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_asset_details tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_livestock_details (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f13_dairy_cattle  INTEGER,
            f13_draft_cattle  INTEGER,
            f13_buffalo INTEGER,
            f13_ox INTEGER,
            f13_sheep INTEGER,
            f13_goat INTEGER,
            f13_pig INTEGER,
            f13_poultry INTEGER,
            f13_donkeys INTEGER,
            
            f13_status INTEGER,
            f13_created_date text,
            f13_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_livestock_details tables', err.tx, err.err);
        });


        this.query(`CREATE TABLE IF NOT EXISTS tbl_cultivation_data (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f10_land TEXT,
            f10_cultivating INTEGER,
            f10_crop_variety INTEGER,
            f10_other_variety TEXT,
            f10_stage TEXT,
            f10_expected INTEGER,
            f10_expectedprice TEXT,
            f10_expectedincome TEXT,
            f10_diseases TEXT,
            f10_pest TEXT,
            
            f10_status INTEGER,
            f10_created_date TEXT,
            f10_modified_date TEXT,

            local_id INTEGER PRIMARY KEY,
            server_id text,
            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_cultivation_data tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_yield_details (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            f11_cultivating INTEGER,
            f11_achieved TEXT,
            f11_income TEXT,
            f11_diseases TEXT,
            f11_fertilizers TEXT,

            f11_status INTEGER,
            f11_created_date text,
            f11_modified_date text,

            local_id INTEGER PRIMARY KEY,
            server_id text,
            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_yield_details tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_financial_details (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            loan_want TEXT,
            loan_amount TEXT,
            fx_monthly_income TEXT,
            f8_loan_taken TEXT,
            f8_private_lenders TEXT,
            f8_borrowed_amount_date TEXT,
            f8_borrowed_amount TEXT,
            f8_borrowed_loan_per TEXT,
            f8_borrowed_loan_month TEXT,
            f8_borrowed_total_amount TEXT,
            f8_borrowed_total_int TEXT,
            f8_borrowed_amount_emi TEXT,
            f8_borrowed_emi_paid TEXT,
            f8_borrowed_outstanding_amount TEXT,
            f8_borrowed_outstanding_principal TEXT,
            f8_borrowed_amount_emi_rem TEXT,

            f8_status INTEGER,
            f8_created_date text,
            f8_modified_date text,

            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_financial_details tables', err.tx, err.err);
        });

        this.query(`CREATE TABLE IF NOT EXISTS tbl_loan_details (
            fm_caid INTEGER,
            fm_id INTEGER,
            
            loan_sanctioned TEXT,
            loan_type TEXT,
            loan_provider TEXT,
            f15_borrowed_amount TEXT,
            f15_borrowed_loan_per TEXT,
            f15_borrowed_loan_month TEXT,
            f15_borrowed_total_amount TEXT,
            f15_borrowed_total_int TEXT,
            f15_borrowed_amount_emi TEXT,
            f15_borrowed_emi_paid TEXT,
            f15_borrowed_outstanding_amount TEXT,
            f15_borrowed_outstanding_principal TEXT,
            f15_borrowed_amount_emi_rem TEXT,

            f15_status INTEGER,
            f15_created_date text,
            f15_modified_date text,

            local_id INTEGER PRIMARY KEY,
            server_id text,
            local_upload INTEGER DEFAULT 0
        )`).catch(err => {
            console.error('Storage: Unable to create tbl_loan_details tables', err.tx, err.err);
        });
    }

    /**
    * Perform an arbitrary SQL operation on the database. Use this method
    * to have full control over the underlying database through SQL operations
    * like SELECT, INSERT, and UPDATE.
    *
    * @param {string} query the query to run
    * @param {array} params the additional params to use for query placeholders
    * @return {Promise} that resolves or rejects with an object of the form { tx: Transaction, res: Result (or err)}
    */
    query(query: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this._db.transaction((tx: any) => {
                    tx.executeSql(query, params,
                        (tx: any, res: any) => resolve({ tx: tx, res: res }),
                        (tx: any, err: any) => reject({ tx: tx, err: err }));
                },
                (err: any) => reject({ err: err }));
            } catch (err) {
                reject({ err: err });
            }
        });
    }

    getDb(){
        return this._db;
    }

    updateUploadStatus(tablename, farmerId, status){
        //if status = 0
        if(status == 0){
            let query_ = 'SELECT * FROM tbl_queue WHERE local_id = ? AND tablename = ?'; 
            let value_ = [farmerId, tablename];
            //1 - check farmer id is array or string
            //farmerId[0] = lfm_id;
            //farmerId[1] = extra_id;
            if(Array.isArray(farmerId)){
                query_ = 'SELECT * FROM tbl_queue WHERE local_id = ? AND extra_id = ? AND tablename = ?';
                value_ = [farmerId[0], farmerId[1] , tablename];
            }

            //1.1 - check if not already in queue
            this.query(query_, value_).then(data => {
                if(data.res.rows.length < 1){ 

                    let _value_ = [farmerId, 0, tablename];
                    //1 - check farmer id is array or string
                    if(Array.isArray(farmerId)){
                        _value_ = [farmerId[0], farmerId[1], tablename];
                    }

                    //if true then its not available now insert
                    this.query('INSERT INTO tbl_queue(local_id, extra_id, tablename) VALUES(?, ?, ?)', _value_).then((d) => {
                        
                        if(Array.isArray(farmerId)){
                            this.events.publish('table:updated', tablename, farmerId[0], farmerId[1]);
                            this.events.publish('farmer:updateToServer');
                        }else{
                            this.events.publish('table:updated', tablename, farmerId);
                            this.events.publish('farmer:updateToServer');
                        }

                        let err_local_id = farmerId;
                        let err_extra_id = '';
                        if(Array.isArray(farmerId)){
                            err_local_id = farmerId[0];
                            err_extra_id = farmerId[1];
                        }
                        console.log('deleting from errors', farmerId);
                        //clear all existing errors for this device
                        this.query("DELETE FROM tbl_errors WHERE local_id = ? and extra_id = ? and tablename = ?", [err_local_id, err_extra_id, tablename]).then(d => {
                            console.log('Deleted from errors', d);
                        }, err => {
                            console.log("SQL : errors while removing errors from table", err);
                        });

                    }, (e) => {console.log(e);});

                }
            }, error => {
                console.log(error);
            });

        }else{
            
            let query_ = 'DELETE FROM tbl_queue WHERE local_id = ? AND tablename = ?'; 
            let value_ = [farmerId, tablename];
            //1 - check farmer id is array or string
            if(Array.isArray(farmerId)){
                query_ = 'DELETE FROM tbl_queue WHERE local_id = ? AND extra_id = ? AND tablename = ?'
                value_ = [farmerId[0], farmerId[1] , tablename];
            }

            this.query(query_, value_).then(data => {

                this.events.publish('farmer:updateToServer');
                let err_local_id = farmerId;
                let err_extra_id = '';
                if(Array.isArray(farmerId)){
                    err_local_id = farmerId[0];
                    err_extra_id = farmerId[1];
                }

                //clear all existing errors for this device
                this.query("DELETE FROM tbl_errors WHERE local_id = ? and extra_id = ? and tablename = ?", [err_local_id, err_extra_id, tablename]).then(
                    d => {}, 
                    err => {
                    console.log("SQL : errors while removing errors from table", err);
                });

            },err => { console.log(err); });
        }

        this._db.transaction((tx: any) => {

            let lid = Array.isArray(farmerId) ? farmerId[0] : farmerId;
            tx.executeSql('SELECT * FROM tbl_farmers WHERE local_id = ?', [lid]
            , (txx, data) => {
                if(data.rows.length > 0){
                    let item = data.rows.item(0);

                    if(item['insert_type'] == 1){
                        this.updateInsertType(Array.isArray(farmerId) ? farmerId[0] : farmerId, tx);
                    }
                }
            }, (txx, err) => {
                console.log(err);
            });
        },(err: any) => console.log(err));
    }

    getFarmerByLocalId(local_id){
        return this.query('SELECT * FROM tbl_farmers WHERE local_id = ?', [local_id]);
    }

    set_fm_id(fm_id, local_id){
        this.query('UPDATE tbl_farmers SET fm_id = ? WHERE local_id = ?', [fm_id, local_id]).catch(err => {
            console.log(err);
        });
    }

    addError(tablename, local_id, code, msg){

        this.query('SELECT * FROM tbl_errors WHERE local_id = ? and tablename = ? and error_code = ?', [local_id, tablename, code]).then(data => {
            if(data.res.rows.length < 1){
                this.query('INSERT INTO tbl_errors(local_id, tablename, error_code, error_message) VALUES(?, ?, ?, ?)', [
                    local_id,
                    tablename,
                    code,
                    msg
                ]).then(data => {
                    this.events.publish('farmer:updateToServer');
                },
                err => {
                    console.log(err);
                });
            }
        },err => {
            console.log(err);
        });
    }

    addErrorTx(tablename, local_id, code, msg, tx): Promise<any>{
        return new Promise((resolve, reject) => {
            try {

                let ext_id = '';
                let loc_id = local_id;
                if(Array.isArray(local_id)){
                    loc_id = local_id[0];
                    ext_id = local_id[1];
                }

                tx.executeSql('SELECT * FROM tbl_errors WHERE local_id = ? and extra_id = ? and tablename = ? and error_code = ?', [loc_id, ext_id, tablename, code], (txx, data) => {
                    if(data.rows.length < 1){
                        tx.executeSql('INSERT INTO tbl_errors(local_id, extra_id, tablename, error_code, error_message) VALUES(?, ?, ?, ?, ?)', [
                            loc_id,
                            ext_id,
                            tablename,
                            code,
                            msg
                        ], (txx, data) => {
                            resolve({res: 'true'});
                        },
                        (txx, err) => {
                            reject({ err: err });
                        });
                    }
                }, (txx, err) => {
                    reject({ err: err });
                });
            } catch (err) {
                reject({ err: err });
            }
        });
    }

    updateExtraTableServerID(tablename, local_id, insert_id){
        this.query("UPDATE " + tablename + " SET server_id = ? WHERE local_id = ?" , [
            insert_id,
            local_id
        ]).then(data => {
            this.events.publish('farmer:updateToServer');
        },
        err => {
            console.log(err);
        });
    }

    addToDelete(tablename, server_id){
        this.query('SELECT * FROM tbl_delete WHERE server_id = ? and tablename = ?', [server_id, tablename]).then(data => {
            if(data.res.rows.length < 1){
                this.query('INSERT INTO tbl_delete(server_id, tablename) VALUES(?, ?)', [
                    server_id,
                    tablename
                ]).then(data => {
                    this.events.publish('farmer:deletedLocal');
                },
                err => {
                    console.log(err);
                });
            }
        },err => {
            console.log(err);
        });
    }

    delete_rows(tablename, local_id){
        this.query('DELETE FROM '+ tablename +' WHERE fm_id = ?', [local_id]).then(
            data => {
                //clear all existing errors for this device
                this.query("DELETE FROM tbl_errors WHERE local_id = ? and tablename = ?", [local_id, tablename]).then( d => {
                    console.log('Deleted from errors', d);
                }, err => {
                    console.log("SQL : errors while removing errors from table", err);
                });
            },
            err => {
                console.log(err);
            }
        );
    }

    has_rows(tablename, local_id){
        return this.query('SELECT * FROM '+ tablename +' WHERE fm_id = ?', [local_id]);
    }

    updateInsertType(local_id, tx){
        let query_str = 'SELECT t0.fm_id FROM tbl_personal_detail AS t0 JOIN tbl_residence_details AS t1 ON t0.fm_id = t1.fm_id JOIN tbl_applicant_knowledge AS t2 ON t0.fm_id = t2.fm_id JOIN tbl_applicant_phone AS t4 ON t0.fm_id = t4.fm_id JOIN tbl_family_details AS t5 ON t0.fm_id = t5.fm_id JOIN tbl_appliances_details AS t6 ON t0.fm_id = t6.fm_id JOIN tbl_spouse_details AS t7 ON t0.fm_id = t7.fm_id JOIN tbl_asset_details AS t8 ON t0.fm_id = t8.fm_id JOIN tbl_livestock_details AS t9 ON t0.fm_id = t9.fm_id JOIN tbl_financial_details AS t10 ON t0.fm_id = t10.fm_id JOIN tbl_land_details AS t11 ON t0.fm_id = t11.fm_id JOIN tbl_cultivation_data AS t12 ON t0.fm_id = t12.fm_id JOIN tbl_yield_details AS t13 ON t0.fm_id = t13.fm_id ';

        //check if loan has taken or not, if not then dont include loan table
        tx.executeSql("SELECT * FROM tbl_financial_details WHERE f8_loan_taken = ? and fm_id = ? limit 1" , ['yes', local_id], (txx, data) => {
            if (data.rows.length > 0) {
                query_str += ' JOIN tbl_loan_details AS t14 ON t0.fm_id = t14.fm_id ';
            }

            //check if married or not, if not then dont include spouse nowledge table
            tx.executeSql("SELECT * FROM tbl_spouse_details WHERE f3_married_status = ? and fm_id = ? limit 1" , ['yes', local_id], (txx, data) => {
                if (data.rows.length > 0) {
                    query_str += ' JOIN tbl_spouse_knowledge AS t3 ON t0.fm_id = t3.fm_id ';
                }

                query_str += ' WHERE t0.fm_id = ?';
                tx.executeSql(query_str, [local_id], (txx, d) => {
                    if(d.rows.length > 0){
                        // this.items[len].update = true;
                        tx.executeSql('UPDATE tbl_farmers SET insert_type = 0 WHERE local_id = ?', [local_id], (txx, dd) => {}, (txx, ee) => {console.log(ee);});

                        //add it to queue if not already
                        this.query('SELECT * FROM tbl_queue WHERE local_id = ? AND tablename = ?', [local_id, 'tbl_farmers']).then(data => {
                            if(data.res.rows.length < 1){
                                this.query('INSERT INTO tbl_queue(local_id, extra_id, tablename) VALUES(?, ?, ?)', [local_id, '', 'tbl_farmers']).then(d => {
                                    console.log('++++++++++++++added to queue+++++++++++++');
                                    // this.events.publish('table:updated', 'tbl_farmers', local_id);
                                    this.events.publish('farmer:updateToServer');
                                }, err => {
                                    console.log(err);
                                });
                            }
                        }, err => console.log(err));

                    }
                }, (txx, err) => {
                    console.log(err);
                });

            }, (txx, err) => {
                console.log(err);
            });
        }, (txx, err) => {
            console.log(err);
        });
    }
}
