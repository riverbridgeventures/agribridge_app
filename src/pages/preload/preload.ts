import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { AuthService, Api } from '../../providers/providers';
import { Sql } from '../../providers/sql/sql';

import {Http, Response} from '@angular/http';
import 'rxjs/Rx';


@IonicPage()
@Component({
	selector: 'page-preload',
	templateUrl: 'preload.html',
})
export class PreloadPage {

	constructor(public navCtrl: NavController, 
				public navParams: NavParams, 
                public sql: Sql,
				public api: Api,
				public http:Http,
				menu: MenuController,
				private auth: AuthService) {

		menu.enable(false);
	}

	ionViewDidLoad() {

		// load states
		this.sql.query('SELECT * FROM tbl_state LIMIT 1', []).then( (data) => {
            if (data.res.rows.length < 1) {
            	this.http.get("assets/json/state.json").map((res:Response) => res.json()).subscribe((data) => {
        			let stateStr = "";
        			for (let row of data) {
        				stateStr += "("+row.id+",'"+row.name+"'),";
        			}
        			stateStr = stateStr.substring(0,stateStr.length-1);
    				this.sql.query('INSERT into tbl_state(id, name) values '+ stateStr).then();
        		});
            }
        }, (error) =>{
        	console.log(error);
        });

		// load Districts
		this.sql.query('SELECT * FROM tbl_district LIMIT 1', []).then((data) => {
            if (data.res.rows.length < 1) {
            	this.http.get("assets/json/district.json")
        		.map((res:Response) => res.json())
        		.subscribe((d) => {
        			let distStr = "";
        			for (let row of d) {
        				distStr += "("+row.id+","+row.state_id+",'"+row.name+"'),";
        			}
        			distStr = distStr.substring(0,distStr.length-1);
    				this.sql.query('INSERT into tbl_district(id, state_id, name) values '+ distStr).then();
        		});
            }
        }, (error) =>{
        	console.log(error);
        });
		

		// load Taluka
		this.sql.query('SELECT * FROM tbl_taluka LIMIT 1', []).then( (data) => {
            if (data.res.rows.length < 1) {
            	this.http.get("assets/json/taluka.json")
        		.map((res:Response) => res.json())
        		.subscribe((data) => {
        			let talukaStr = "";
        			for (let row of data) {
        				talukaStr += "("+row.id+","+row.district_id+",'"+row.name+"'),";
        			}
        			talukaStr = talukaStr.substring(0,talukaStr.length-1);
    				this.sql.query('INSERT into tbl_taluka(id, district_id, name) values '+ talukaStr).then();
        		});
            }
        }, (error) =>{
        	console.log(error);
        });

		// load village
		this.sql.query('SELECT * FROM tbl_village LIMIT 1', []).then( (data) => {
            if (data.res.rows.length < 1) {
            	this.http.get("assets/json/village.json")
        		.map((res:Response) => res.json())
        		.subscribe((data) => {
        			let villageStr = "";
        			for (let row of data) {
        				villageStr += "("+row.id+","+row.talukas_id+",'"+row.name+"'),";
        			}
        			villageStr = villageStr.substring(0,villageStr.length-1);
    				this.sql.query('INSERT into tbl_village(id, taluka_id, name) values '+ villageStr).then((dtat)=>{
						
    				}, (error) => {
    					console.log(error);
    				});
    				
        		});
            }
        }, (error) =>{
        	console.log(error);
        });

        // load crops
        this.sql.query('SELECT * FROM tbl_crops LIMIT 1', []).then( (data) => {
            if (data.res.rows.length < 1) {
                this.http.get("assets/json/crops.json").map((res:Response) => res.json()).subscribe((data) => {
                    let cropStr = "";
                    for (let row of data) {
                        cropStr += "("+row.crop_id+",'"+row.crop_name+"'),";
                    }
                    cropStr = cropStr.substring(0,cropStr.length-1);
                    this.sql.query('INSERT into tbl_crops(id, name) values '+ cropStr).then();
                });
            }
        }, (error) =>{
            console.log(error);
        });

        // load varieties
        this.sql.query('SELECT * FROM tbl_varieties LIMIT 1', []).then( (data) => {
            if (data.res.rows.length < 1) {
                this.http.get("assets/json/crop_varieties.json").map((res:Response) => res.json()).subscribe((data) => {
                    let varietiesStr = "";
                    for (let row of data) {
                        varietiesStr += "("+row.variety_id+","+row.crop_id+",'"+row.variety_name+"'),";
                    }
                    varietiesStr = varietiesStr.substring(0,varietiesStr.length-1);
                    this.sql.query('INSERT into tbl_varieties(id, crop_id, name) values '+ varietiesStr).catch(errr => {console.log(errr); });
                });
            }
        }, (error) =>{
            console.log(error);
        });



        //update database
        console.warn('Prepare to db version 1.0.1');
        this.sql.query(`CREATE TABLE IF NOT EXISTS db_versions(
            id INTEGER PRIMARY KEY,
            version text
        )`).then(data => {
            // let tx = data.tx;
            console.warn('Inside db_versions');

            //Database version 1.0.1
            let db = this.sql.getDb();
            db.transaction((tx:any) => {
             
                tx.executeSql('SELECT * FROM db_versions WHERE version = ?', ['1.0.1'], (txx, d) => {
                    if(d.rows.length < 1){

                        //Creating tbl_queue
                        tx.executeSql('CREATE TABLE IF NOT EXISTS tbl_queue (local_id INTEGER, extra_id INTEGER, tablename text )');
                        
                        //Creating tbl_fpo
                        tx.executeSql('CREATE TABLE IF NOT EXISTS tbl_fpos (id INTEGER, fpo_name text, fpo_state text, fpo_district text, fpo_taluka text, fpo_village text )');

                        //Alter tbl_errors table add column extra_id
                        tx.executeSql('ALTER TABLE tbl_errors ADD COLUMN extra_id INTEGER');

                        //Alter tbl_farmers table add column insert_type
                        tx.executeSql('ALTER TABLE tbl_farmers ADD COLUMN insert_type INTEGER DEFAULT 0');

                        //Alter tbl_farmers table add column insert_type
                        tx.executeSql('ALTER TABLE tbl_farmers ADD COLUMN fm_gender TEXT');

                        //Alter tbl_farmers table add column insert_type
                        tx.executeSql('ALTER TABLE tbl_farmers ADD COLUMN fm_fpo INTEGER');

                        //Alter tbl_land_details table add column f9_land_unit
                        tx.executeSql("ALTER TABLE tbl_land_details ADD COLUMN f9_land_unit INTEGER DEFAULT 0");

                        //Alter tbl_land_details table add column f9_land_unit
                        tx.executeSql("ALTER TABLE tbl_cultivation_data ADD COLUMN f10_land_size TEXT");

                        //All done now update version 1.0.1
                        tx.executeSql(`INSERT INTO db_versions(version) values('1.0.1')`);
                        console.log('Database version 1.0.1 created successfully!');

                        //now make any query that is regarding to sqlite
                        this.updateNewDatabase();
                    }
                    else{
                        console.log('Using Database version 1.0.1, updateDatabase called!');
                        this.updateNewDatabase();
                    }
                }, (txx, err) => {
                    console.log(err);
                });

            },(txx, e) => {
                console.log(e);
            });
        },err => {
            console.log(err);
        });
    }


    updateNewDatabase(){
        // load_fpos
        this.sql.query('select id from tbl_fpos').then(local_data => {
            let fpo_ids = [];

            if(local_data.res.rows.length > 0){
                for (let i = 0; i < local_data.res.rows.length; i++) {
                    let item = local_data.res.rows.item(i);
                    if(item.id != ''){
                        fpo_ids.push(item.id);
                    }
                }
            }
            let data = { fpo_ids : fpo_ids.toString()};

            this.api.post("get_all_fpo", data)
            .map((res) => res.json())
            .subscribe(success =>{

                if(success.success){
                    let db = this.sql.getDb();
                    db.transaction((tx: any) => {
                        if(success.data.length > 0){
                            let stateStr = "";
                            for (let row of success.data) {
                                stateStr += "("+row.id+",'"+row.fpo_name+"','"+row.fpo_state+"','"+row.fpo_district+"','"+row.fpo_taluka+"','"+row.fpo_village+"'),";
                            }
                            stateStr = stateStr.substring(0,stateStr.length-1);
                            this.sql.query('INSERT into tbl_fpos(id, fpo_name, fpo_state, fpo_district, fpo_taluka, fpo_village) values '+ stateStr).then(d => {
                                this.goHome();
                            }, e => {
                                console.log(e);
                                this.goHome();
                            });
                        }else{
                            this.goHome();
                        }
                    }, err => {
                        console.log(err)
                        this.goHome();
                    });
                }

            }, err => {
                console.log(err);
                this.goHome();
            });
        }, err => { 
            console.log(err);
            this.goHome();
        });
    }

	goHome(){
		setTimeout(()=>{
            this.auth.isAuthenticated().subscribe(success => {
                if(success){
                    this.navCtrl.setRoot('HomePage');
                }
                else{
                    this.navCtrl.setRoot('UserLogin');
                }
            });
        }, 100);
	}

}
