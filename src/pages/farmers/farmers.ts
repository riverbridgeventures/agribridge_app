import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController, NavParams, IonicPage, LoadingController, ToastController, Platform, AlertController, Events, Content } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Api } from '../../providers/api/api';
import { Sql } from '../../providers/sql/sql';
import { UserProvider } from '../../providers/user/user';

import {
  HttpClient,
  HttpRequest,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';


@IonicPage()
@Component({
		selector: 'farmers-page',
		templateUrl: 'farmers.html'
})
export class FarmersPage {

	@ViewChild(Content) content: Content;

	selectedItem: any;
	icons: string[];
	items: Array<any> = [];
	limit: number = 20;
	offset: number = 0;
	retryButton: boolean = false;
	loading: any;
	query: string;
	infinit_complete: boolean = false;
	errors:any = [];
	ca_id: any = "";
	load:any;
	tapped_len:any = null;

	debug:number = 0;
	constructor(public navCtrl: NavController, 
				public navParams: NavParams, 
				private api: Api,
				public currentUser: UserProvider,
				public platform: Platform,
				private sql: Sql,
				public events: Events,
				private zone: NgZone,
				public http: HttpClient,
				public alertCtrl: AlertController,
				private loadingCtrl: LoadingController,
				public toastCtrl: ToastController) {

		//get ca_id
		this.ca_id = this.currentUser.id;
		// this.initializeItems();
		this.events.subscribe('farmer:updateToServer', () => {
			this.ionViewDidEnter();
		});
	}

	ionViewDidEnter(){
		console.log("last entered ", this.tapped_len);
		if(this.tapped_len != null){
			let db = this.sql.getDb();
			db.transaction((tx: any) => {
        		this.isUpdated(this.tapped_len, tx);
            	this.isUploaded(this.tapped_len, tx);
            	this.hasAnyError(this.tapped_len, tx);
	        },
	        (err: any) => console.error({ err: err }));
		}
	}

	ionViewDidLoad() {
    	this.initializeItems();
    }

	initializeItems(){
		console.log('called init.');
		this.items = [];
		this.offset = 0;
		this.infinit_complete = false;

		this.tapped_len = null;
		this.query = 'SELECT *, (fm_fname || \' \' || fm_mname || \' \' || fm_lname) as fm_name FROM tbl_farmers WHERE fm_caid = ? ORDER BY insert_type DESC, fm_modifieddt DESC LIMIT ?,?';
		
		this.doInfinite();
	}

	doInfinite(infiniteScroll?) {

		this.sql.query(this.query, [this.ca_id, this.offset, this.limit]).then(data => {
			console.log(data);
            if (data.res.rows.length > 0) {
            	let idd = [];
                for(let i=0; i<data.res.rows.length; i++){
                	let item = data.res.rows.item(i);
                	item.update = false;
                	item.local_upload = false;
                	idd.push(this.items.push(item) - 1);
		            this.content.resize();
				}

				let db = this.sql.getDb();
				db.transaction((tx: any) => {
					for (let i = 0; i < idd.length; i++) {
						this.isUpdated(idd[i], tx);
	                	this.isUploaded(idd[i], tx);
	                	this.hasAnyError(idd[i], tx);
					}
		        },
		        (err: any) => console.error({ err: err }));

				infiniteScroll != undefined ? infiniteScroll.complete() : {};
				if(data.res.rows.length < this.limit){
					this.infinit_complete = true;
				}
		        
            }
            else{
            	if(infiniteScroll){
	            	// infiniteScroll.enable(false);
	            	this.infinit_complete = true;
            	} 
            }

            this.loading ? this.loading.dismiss() : {};
        },
        err => {
        	console.log(err);
        	infiniteScroll ? infiniteScroll.complete() : {};
			this.loading ? this.loading.dismiss() : {};
			this.showMessage("Something went wrong! please retry to load Farmers.", 'toast-danger', true);
			this.retryButton = true;
        });

		this.offset += this.limit;
		console.log("offset: ", this.offset);
	}

	deleteItem(farmer){
		console.log(farmer);
		let alert = this.alertCtrl.create({
            title: 'Delete',
            subTitle: 'This action cant\'t be undo!',
            message: 'Do you really want to delete "' + farmer.fm_name + '" from your farmer list?',
            buttons: [
            {
                text: 'No',
                role: 'cancel',
                cssClass: 'app',
                handler: () => {
                }
            },
            {
                text: 'Yes',
                cssClass: 'danger',
                handler: () => {

                	let local_id = farmer.local_id;
                	//crawl each table and send if local_upload is 0
                    this.sql.query("SELECT name FROM sqlite_master WHERE type='table'").then( (data) => {
                        // console.log(data);
                        if (data.res.rows.length > 0) {
                            for (let i = 0; i < data.res.rows.length; i++) {
                                let table = data.res.rows.item(i);
                                if(table.name == 'tbl_personal_detail'
									|| table.name == 'tbl_residence_details'
									|| table.name == 'tbl_applicant_knowledge'
									|| table.name == 'tbl_spouse_knowledge'
									|| table.name == 'tbl_applicant_phone'
									|| table.name == 'tbl_family_details'
									|| table.name == 'tbl_appliances_details'
									|| table.name == 'tbl_spouse_details'
									|| table.name == 'tbl_land_details'
									|| table.name == 'tbl_asset_details'
									|| table.name == 'tbl_livestock_details'
									|| table.name == 'tbl_cultivation_data'
									|| table.name == 'tbl_yield_details'
									|| table.name == 'tbl_financial_details'
									|| table.name == 'tbl_loan_details' 
                                ){
                                    
									this.sql.query( "Delete from "+table.name+" where fm_id = ?;", [local_id])
									.catch(err => { console.log(err) });
                                }
                            }

                            this.sql.query( "SELECT * from tbl_farmers where local_id = ?;", [local_id])
							.then(d => {
								if(d.res.rows.length > 0){
									let final_farmer = d.res.rows.item(0);

		                            this.sql.query( "Delete from tbl_farmers where local_id = ?;", [local_id])
									.then(data => {
										
										//clear all existing errors for this device
						                this.sql.query("DELETE FROM tbl_errors WHERE local_id = ? and tablename = ?", [local_id, 'tbl_farmers']).catch(err => {
						                    console.log("SQL : errors while removing errors from table", err);
						                });

			                            let index = this.items.indexOf(farmer);	
										let server_id = final_farmer.fm_id;
										if(index !== -1){
											this.items.splice(index, 1);
											//if its sent to server then add server_id to delete queu
						                	if (server_id != '' && server_id !== null) {
						                		this.sql.addToDelete("tbl_farmers", server_id);
						                	}
										}
										
									},err => { console.log(err) });
								}

							},err => { console.log(err) });

							
                        }
                    });
                }
            }]
        });
		alert.present();
	}

	onRetryClick(){
		this.offset = 0;
		this.retryButton = false;
		this.initializeItems();
	}

	//on search text box fill
	getItems(ev: any) {

		this.items = [];
		this.offset = 0;
		this.infinit_complete = false;
		this.tapped_len = null;
		
		
		// set val to the value of the searchbar
		let val = ev.target.value;

		// if the value is an empty string don't filter the items
		// val = val.trim();
		let val1 = val;
		if (val && val1.trim() != '') {
			this.query = 'SELECT *, (fm_fname || \' \' || fm_mname || \' \' || fm_lname) as fm_name FROM tbl_farmers WHERE fm_caid = ? and (fm_mobileno LIKE \'%'+ val +'%\' OR (trim(fm_fname) || \' \' || trim(fm_mname) || \' \' || trim(fm_lname)) LIKE \'%'+ val +'%\' OR (trim(fm_fname) || \' \' || trim(fm_lname)) LIKE \'%'+ val +'%\')';
			this.query +=' ORDER BY insert_type DESC, fm_modifieddt DESC LIMIT ?,?';
			this.doInfinite();
		}
		else{
			this.initializeItems();
		}
	}

	showMessage(message, style, retry?: boolean, dur?: number){
		const toast = this.toastCtrl.create({
			message: message,
			showCloseButton: true,
			duration: dur || 0,
			closeButtonText: 'Ok',
			cssClass: style,
			dismissOnPageChange: true
	    });
	    toast.present();
	}

	itemTapped(event, farmer, ind) {
		console.log(farmer);
		this.tapped_len = ind;
		this.navCtrl.push('Farmerdetail', {
				farmer: farmer
		});
	}

	goto(page: string){
		// callback...
		let _that = this;
		let myCallbackFunction = function(_params) {
			return new Promise((resolve, reject) => {
				console.log(_params);
				if(_params){
					_that.initializeItems();
				}
				resolve();
			});
		}

		this.navCtrl.push(page, {
		    callback: myCallbackFunction
		});
	}

	isUpdated(len, tx){
		let item = this.items[len];
		let query_str = 'SELECT t0.fm_id FROM tbl_personal_detail AS t0 JOIN tbl_residence_details AS t1 ON t0.fm_id = t1.fm_id JOIN tbl_applicant_knowledge AS t2 ON t0.fm_id = t2.fm_id JOIN tbl_applicant_phone AS t4 ON t0.fm_id = t4.fm_id JOIN tbl_family_details AS t5 ON t0.fm_id = t5.fm_id JOIN tbl_appliances_details AS t6 ON t0.fm_id = t6.fm_id JOIN tbl_spouse_details AS t7 ON t0.fm_id = t7.fm_id JOIN tbl_asset_details AS t8 ON t0.fm_id = t8.fm_id JOIN tbl_livestock_details AS t9 ON t0.fm_id = t9.fm_id JOIN tbl_financial_details AS t10 ON t0.fm_id = t10.fm_id JOIN tbl_land_details AS t11 ON t0.fm_id = t11.fm_id JOIN tbl_cultivation_data AS t12 ON t0.fm_id = t12.fm_id JOIN tbl_yield_details AS t13 ON t0.fm_id = t13.fm_id ';

		//check if loan has taken or not, if not then dont include loan table
		tx.executeSql("SELECT * FROM tbl_financial_details WHERE f8_loan_taken = ? and fm_id = ? limit 1" , ['yes', item.local_id], (txx, data) => {
            if (data.rows.length > 0) {
            	query_str += ' JOIN tbl_loan_details AS t14 ON t0.fm_id = t14.fm_id ';
            }

			//check if married or not, if not then dont include spouse nowledge table
            tx.executeSql("SELECT * FROM tbl_spouse_details WHERE f3_married_status = ? and fm_id = ? limit 1" , ['yes', item.local_id], (txx, data) => {
	            if (data.rows.length > 0) {
            		query_str += ' JOIN tbl_spouse_knowledge AS t3 ON t0.fm_id = t3.fm_id ';
	            }

				query_str += ' WHERE t0.fm_id = ?';
				tx.executeSql(query_str, [item.local_id], (txx, d) => {

					this.zone.run(() => {
						if(d.rows.length > 0){
							this.items[len].update = true;
						}else{
							this.items[len].update = false;
						}
					});

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

	isUploaded(len, tx){
		// console.log('isUploaded called');
		let item = this.items[len];

		tx.executeSql(`SELECT * from tbl_queue WHERE local_id = ?`, [item.local_id], (txx, d) => {
			this.zone.run(() => {
				if(d.rows.length < 1){
					this.items[len].local_upload = true;
				}else{
					this.items[len].local_upload = false;
				}
			});
		},
		(txx, err) => {
			console.log(err);
		});
	}

	hasAnyError(len, tx){
		let item = this.items[len];
		tx.executeSql("SELECT * FROM tbl_errors WHERE local_id = ?", [item.local_id], (txx, d) => {
			// console.log("errors", d);
			this.zone.run(() => {
				if(d.rows.length > 0){
					this.items[len].hasErrors = true;
					this.errors[item.local_id] = [];
					for (let i = 0; i < d.rows.length; i++) {
						this.errors[item.local_id].push(d.rows.item(i));
					}
				}else{
					this.items[len].hasErrors = false;
				}
			});
		});
	}


	total_inserted: number = 0;
	total_loaded: number = 0;
	is_cancelable: boolean = true;
	cutivation_data: Array<any> = [];
	error_ids: any = [];
	error_local_ids: any = [];

	loadOnlineFarmers(){
		let alt = this.alertCtrl.create({
			subTitle: "Load Farmers",
			message: "Loading farmers from the Server may take several minutes on slow internet connection. press <b>Continue</b> to proceed loading or <b>Cancel</b> to cancel.",
			buttons: [
				{ text: "Cancel", role: "cancel"},
				{ text: "Continue", role: "ok", handler: () => { this.onProceedLoading(); } }
			]
		});

		alt.present();
	}

	onProceedLoading(){

		this.load = this.loadingCtrl.create({
		    content: '<span>Please Wait</span>'
		});
		this.load.present();
		
		this.sql.query('select fm_id from tbl_farmers where fm_id != \'\'').then(local_data => {
			let fm_ids = [];

			if(local_data.res.rows.length > 0){
				for (let i = 0; i < local_data.res.rows.length; i++) {
					let item = local_data.res.rows.item(i);
					if(item.fm_id != ''){
						fm_ids.push(item.fm_id);
					}
				}
			}
			let data = { fm_ids : fm_ids.toString(), total: ''};


			let header = new HttpHeaders({'Content-Type':'application/x-www-form-urlencoded', 'Authorization': this.currentUser.token});
			let param = new HttpParams()
			.set("fm_ids", fm_ids.toString())
			.set("total", '10').toString();

			let req = new HttpRequest('POST', 'http://acrefin.com/api/v1/fm_data', { 
				headers : header, 
				reportProgress : true,
				total : param
			});


			this.http.post('http://acrefin.com/api/v1/fm_data', param.toString(), {
				headers : header,
				reportProgress : true,
				observe: 'events'
			}).subscribe((event: HttpEvent<any>) => {
				switch (event.type) {
					case HttpEventType.Sent:
						console.log('Request sent!');
					break;
					case HttpEventType.ResponseHeader:
						console.log('Response header received!');
					break;
					case HttpEventType.DownloadProgress:
						const mbloaded:any = (event.loaded / 1024 / 1024).toFixed(2);
						if(mbloaded > 0.1){
							this.load.data.content = "<strong>Downloading</strong><br><span> <strong>" + mbloaded + " MB </strong> loaded.</span>";
						}
					break;
					case HttpEventType.Response:
						console.log('Done!', event.body);
						let body = event.body;
						this.loadData(body);
				}
			},(err) => {
				this.load.dismiss();
				let alert = this.alertCtrl.create({
					title: 'Failed!',
					message: 'An error has occured while downloading data from the server, Make sure Internet/Data connection is on and try again.',
					buttons: [
						{text: 'OK', role: 'ok'}
					]
				});
				alert.present();
				console.log(err);
			}
			,() => {
				console.log('done.....');
			});

		});
	}
	
	loadData(body){
		if(body.success){
			if(body.error_ids != undefined){
				this.error_ids = body.error_ids;
			}

    		if(body.data.length > 0){
        		let db = this.sql.getDb();
        		db.transaction((tx: any) => {
        			this.total_loaded = body.data.length;

        			//loop through each farmer
	        		for (let j = 0; j < body.data.length; j++) {
	        			let farmer = body.data[j];

	        			//loop through each table value
	        			for (let k = 0; k < farmer.values.length; k++) {
	        				this.cloneData(farmer.fm_id, farmer.values[k], tx, (k === farmer.values.length -1 && j === body.data.length -1));
	        				if((k === farmer.values.length -1 && j === body.data.length -1)){
		        				console.log('j =', j, 'k =', k, '-----Last Entry Found-----');
	        				}
	        			}
	        		}
                },
                (err: any) => console.log({ err: err }));
    		}
    		else{
    			this.load.dismiss();
    			let alert = this.alertCtrl.create({
    				title: "Already loaded!",
    				subTitle: "No more farmers available on the Server.",
    				buttons:[{ text: "OK"}]
    			});

    			alert.present();
    		}
    	}
    	else{
    		this.load.dismiss();
    	}
	}

	async cloneData(fm_id, val, tx, isLast?){

		let tablename = val['tablename'];

		if(tablename != ''){

			await tx.executeSql("SELECT sql FROM sqlite_master WHERE tbl_name = ? AND type = 'table'", [tablename], (txx, data) => {

				let columns = this.getColArray(data.rows.item(0).sql);
			    let query = 'Insert into ' + tablename;

			    if(tablename == 'tbl_farmers'){
			    
			    	columns.pop(); //remove fm_fpo
			    	columns.pop(); //remove insert_type
			    	columns.pop(); //remove local_upload
			    	columns.pop(); //remove fm_gender
			    	columns.pop(); //remove local_id

			    	columns.push('fm_gender');
			    	columns.push('fm_fpo');
			    	columns.push('insert_type');
			    	
			    	// columns.push('insert_type');
			    }
			    else if(tablename === 'tbl_loan_details' || tablename === 'tbl_yield_details'){

			    	columns.pop(); //remove local_upload
			    	columns.pop(); //remove server_id
			    	columns.pop(); //remove local_id
			    	columns.push('server_id');
			    }
			    else if(tablename === 'tbl_land_details'){

			    	columns.pop(); //remove f9_land_unit
			    	columns.pop(); //remove local_upload
			    	columns.pop(); //remove server_id
			    	columns.pop(); //remove local_id
			    	columns.push('f9_land_unit');
			    	columns.push('server_id');
			    }
			    else if(tablename === 'tbl_cultivation_data'){

			    	columns.pop(); //remove f10_land_size
			    	columns.pop(); //remove local_upload
			    	columns.pop(); //remove server_id
			    	columns.pop(); //remove local_id
			    	columns.push('f10_land_size');
			    	columns.push('server_id');
			    }

			    query += '(' + columns.toString() + ') values(';
			    for (let i = 0; i < columns.length; i++) {
			    	query += '?,';
			    }
			    query = query.substring(0,query.length - 1);
			    query += ')';

			    if(val.rows.length > 0){
				    for (let m = 0; m < val.rows.length; m++) {

					    let serverRow = val.rows[m];

					    let final_data:any = {};
					    for (let i = 0; i < columns.length; i++) {
					    	final_data[columns[i]] = serverRow[columns[i]];
					    }

						if(tablename != 'tbl_farmers'){
						    tx.executeSql('Select local_id from tbl_farmers where fm_id = ? ', [fm_id], (txx, d) => {
						    		
						    	if(d.rows.length > 0){
						    		let item = d.rows.item(0);
							    	final_data['fm_id'] = item['local_id'];
						    		
						    		if(tablename === 'tbl_land_details' || tablename === 'tbl_cultivation_data' || tablename === 'tbl_loan_details' || tablename === 'tbl_yield_details'){

								    	final_data['server_id'] = serverRow['id']+'';

								    	if(tablename === 'tbl_cultivation_data'){
											final_data['f10_cultivating']  = parseInt(final_data['f10_cultivating']);
											final_data['f10_crop_variety'] = parseInt(final_data['f10_crop_variety']);
											final_data['f10_expected']     = parseFloat(final_data['f10_expected']);
											this.cutivation_data.push(final_data['f10_land']);
										}

										if(tablename === 'tbl_land_details'){
											final_data['f9_land_unit']  = parseInt(final_data['f9_land_unit']) || 0;
										}
							    	}

							    	
						    		this.insertData(tablename, query, final_data, tx, isLast || false);
						    	}

						    }, (txx, err) => {
						    	console.log(tablename, err);
						    });
					    	
					    }else{

					    	let now = Date.now();

					    	// let date1 = new Date('01/23/2018');
					    	// console.log(date1.getTime(), date2.getTime(), final_data['fm_createddt'], date1.getTime() > date2.getTime());
					    	// if(date1.getTime() > date2.getTime()){
					    	// 	this.error_ids.push(final_data['fm_id']);
					    	// }

							final_data['insert_type']   = parseInt(final_data['insert_type']);
							final_data['fm_fpo']        = parseInt(final_data['fm_fpo']);
							let date2                   = new Date(final_data['fm_createddt']);
							let date3                   = new Date(final_data['fm_modifieddt']);
							final_data['fm_createddt']  = date2.getTime();
							final_data['fm_modifieddt'] = date3.getTime();

							console.log(query,final_data); 
					    	this.insertData(tablename, query, final_data, tx, isLast || false);
					    }
				    }
			    }
			    else{
			    	if(isLast){
			    		// console.log(tablename);
				    	this.insertData('LASTFLAG', '', [], tx, isLast);
			    	}
			    }
			},
			(txx, err) => console.log(err));
		}
	}

	insertData(tablename, query, final_data, tx, isLast = false){

		if(tablename === 'LASTFLAG'){
			if(isLast){
			    this.sql.query("SELECT * FROM tbl_farmers limit 0,1", []).then(data => {
			    	console.log('LASTFLAG');
			    	let db = this.sql.getDb();			    	
					db.transaction((tx: any) => {
				    	this.updateCultivation(tx);
			        },
			        (err: any) => console.error({ err: err }));

			    },err => {
			    	console.log('LASTFLAG Error', err);
			    	let db = this.sql.getDb();			    	
					db.transaction((tx: any) => {
				    	this.updateCultivation(tx);
			        },
			        (err: any) => console.error({ err: err }))
			    });
			}
		}
		else{

			delete final_data['id'];

	    	let dumFinal = [];
	    	for (let key in final_data) {
	    		if(key.includes('_status') && key != 'f3_married_status'){
	    			final_data[key] = 0;
	    		}
	    		dumFinal.push(final_data[key]);
	    	}

		    tx.executeSql(query, dumFinal, (txx, dat) => {
		    	if(tablename === 'tbl_farmers'){
			    	this.total_inserted++;
			    	let found = this.error_ids.find(x => x == final_data['fm_id']);
			    	if(found && dat.rowsAffected){
			    		this.error_local_ids.push(dat.insertId);
			    	}

			    	this.zone.run(() => {
						this.load.data.content = "<b>" + this.total_inserted + " / " + this.total_loaded + "</b> farmers loaded";
					});
		    	}
		    	
		    	if(isLast){
			    	this.updateCultivation(tx);
			    }
		    }, (txx, err) => {
		    	console.log(tablename, err);
		    	if(isLast){
			    	this.updateCultivation(tx);
			    }
		    });
		}
	}

	updateCultivation(tx){

		tx.executeSql('UPDATE tbl_cultivation_data SET f10_land = (SELECT local_id FROM tbl_land_details WHERE server_id = tbl_cultivation_data.f10_land)', [], (txx, dd) => {
			console.log(dd);
	    	this.updateErrors(txx);
		}, (txx, err) => {
			console.log(err);
			this.updateErrors(txx);
		});
	}

	updateErrors(tx){
		let tables:any = [
			{ name: 'tbl_personal_detail', form_name: 'Personal Details'},
			{ name: 'tbl_residence_details', form_name: 'Residence Details'},
			{ name: 'tbl_applicant_knowledge', form_name: 'Applicant Knowledge'},
			{ name: 'tbl_spouse_knowledge', form_name: 'Spouse Knowledge'},
			{ name: 'tbl_applicant_phone', form_name: 'Applicant Phone'},
			{ name: 'tbl_family_details', form_name: 'Family Details'},
			{ name: 'tbl_appliances_details', form_name: 'Appliances Details'},
			{ name: 'tbl_spouse_details', form_name: 'Spouse Details'},
			{ name: 'tbl_asset_details', form_name: 'Asset Details'},
			{ name: 'tbl_livestock_details', form_name: 'Livestocke Details'},
			{ name: 'tbl_financial_details', form_name: 'Financial Details'},
			{ name: 'tbl_land_details', form_name: 'Land Details'},
			{ name: 'tbl_cultivation_data', form_name: 'Crop Cultivation Details'},
			{ name: 'tbl_yield_details', form_name: 'Previouse Crop Details'},
			{ name: 'tbl_loan_details', form_name: 'Loan Details'}
		];
		let msg = '';
		let name = '';
		let isLast = false;
		if(this.error_local_ids.length > 0){
			for(let i=0; i < this.error_local_ids.length; i++){
				for(let j=0; j < tables.length; j++){
					msg = tables[j].form_name + ' is not valid.';
					name = tables[j].name;

					let _localId = this.error_local_ids[i];
					if(name === 'tbl_land_details' || name === 'tbl_cultivation_data' || name === 'tbl_yield_details' || name === 'tbl_loan_details'){
						
						if(i === this.error_local_ids.length -1 && j === tables.length -1){
							isLast = true;
						}

						this.generateErrForAll(name, _localId, msg, tx, isLast);

					}else{
						this.addErrors(name, _localId, msg, tx, false);
					}
				}
			}
		}else{
	    	if(this.load){
	    		this.load.dismiss();
	    		this.load = null;
		    	this.initializeItems();
	    	}
		}
	}

	generateErrForAll(name, _localId, msg, tx, isLast){
		let extra_ids = [];
		//SELECT * FROM tbl_land_details WHERE fm_id = ?
		tx.executeSql('SELECT local_id FROM ' + name + ' WHERE fm_id = ?', [_localId], (txx, d) => {
			if(d.rows.length > 0){
				for(let n=0; n < d.rows.length; n++){
					let ite = d.rows.item(n);
					extra_ids.push(ite['local_id']);
				}
			}
			this.addErrors(name, [extra_ids, _localId], msg, tx, isLast);

		}, (txx, e) => {
			console.log(e);
			this.addErrors(name, extra_ids, msg, tx, isLast);
		});
	}

	addErrors(name, lid, msg, tx, isLast){

		//lid[0] = [local_id, local_ic];
		//lid[1] = lfm_id;
		if(Array.isArray(lid)){
			console.log(name, 'Adding errors');
			if(lid[0].length > 0){
				for(let i=0; i < lid[0].length; i++){
					this.sql.addErrorTx(name, [ lid[1], lid[0][i]], '101', msg, tx).then(data => {
						if(isLast && i === lid[0].length -1){
					    	if(this.load){
					    		this.load.dismiss();
					    		this.load = null;
						    	this.initializeItems();
					    	}
						}
					},err => {
						console.log(err);
						if(isLast && i === lid[0].length -1){
					    	if(this.load){
					    		this.load.dismiss();
					    		this.load = null;
						    	this.initializeItems();
					    	}
						}
					});
				}
			}
			else{
				if(isLast){
			    	if(this.load){
			    		this.load.dismiss();
			    		this.load = null;
				    	this.initializeItems();
			    	}
				}
			}
		}else{
			this.sql.addErrorTx(name, lid, '101', msg, tx).then(data => {
				if(isLast){
			    	if(this.load){
			    		this.load.dismiss();
			    		this.load = null;
				    	this.initializeItems();
			    	}
				}
			},err => {
				console.log(err);
				if(isLast){
			    	if(this.load){
			    		this.load.dismiss();
			    		this.load = null;
				    	this.initializeItems();
			    	}
				}
			});
		}
	}

	getColArray(sql){
	    sql = sql + '';
	 	let columns = sql.split('(');
	 	columns = columns[1].split(')')[0];
	 	columns = columns.split(',');

	 	let colarray = [];
	 	for (let i = 0; i < columns.length; i++) {
	 		let a = columns[i].trim().split(' ');

	 		colarray.push(a[0]);
	 	}
	    return colarray;		
	}
}
