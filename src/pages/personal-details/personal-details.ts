import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Sql } from '../../providers/sql/sql';
import { ExtraValidator } from '../../validators/ExtraValidator';

/**
 * Generated class for the PersonalDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
 	selector: 'page-personal-details',
 	templateUrl: 'personal-details.html',
 })
 export class PersonalDetailsPage {

 	personal: FormGroup;
    submitAttempt: boolean = false;
    retryButton: boolean = false;
    fm_id: any = null;
    exist: boolean = false;    
    fpos: any = [];
 	constructor(public navCtrl: NavController, 
                public navParams: NavParams, 
                public sql: Sql,
                public formBuilder: FormBuilder) {

 		this.personal = formBuilder.group({

            fm_fname: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
            fm_mname: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z0-9 ]*')])],
            fm_lname: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
            fm_mobileno: ['', Validators.compose([Validators.pattern('^[0-9\-]{10}$'), Validators.required]), (control) => this.checkMobilePersonal(control, this.fm_id)],
            fm_aadhar: ['', Validators.compose([Validators.pattern('^[0-9]{12}$'), Validators.required]), (control) => this.checkAadharPersonal(control, this.fm_id)],
            fm_fpo: ['', Validators.required],
            fm_gender: ['', Validators.required],
            
            f1_mfname: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
            f1_mmname: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
            f1_dob: ['', Validators.required],
            f1_age: [''],
            f1_altno: ['', Validators.pattern('^[0-9]{10}$')],
            any_other_select: ['', Validators.required],
            f1_ppno: ['', Validators.pattern('^[0-9A-Za-z-/\_$&@]{8}$')],
            f1_pancard: ['', Validators.pattern('^[0-9A-Za-z-/\_$&@]{10}$')],
            f1_vote: ['', Validators.pattern('^[0-9A-Za-z-/\_$&@]{10}$')],
            f1_licno: ['', Validators.pattern('^[0-9A-Za-z-/\_$&@]{10}$')],
            f1_otherno: ['', Validators.compose([Validators.maxLength(20),Validators.pattern('^[0-9A-Za-z-/\_$&@]*')] )],
            f1_expfarm: ['', Validators.compose([Validators.maxLength(2), Validators.pattern('^[0-9.]*'), Validators.required])],
        });

        this.personal.controls.f1_dob.valueChanges.subscribe(() => {
        	let dob = this.personal.controls.f1_dob.value;
        	this.personal.controls.f1_age.setValue(this.getAge(dob));
        });

        // load fpos
        this.sql.query('SELECT * FROM tbl_fpos', []).then( (data) => {
            if (data.res.rows.length > 0) {
                let sta = [];
                for(let i=0; i<data.res.rows.length; i++){
                    sta.push(data.res.rows.item(i));
                }
                this.fpos = sta;
            }
        }, (error) =>{
            console.log(error);
        });
        console.log('load farmers')
 	}

 	getAge(dateString) {
	    let today = new Date();
	    let birthDate = new Date(dateString);
	    let age = today.getFullYear() - birthDate.getFullYear();
	    let m = today.getMonth() - birthDate.getMonth();
	    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
	        age--;
	    }
	    return age;
	}

 	ionViewDidEnter() {

        this.exist = false;
        this.fm_id = this.navParams.get('farmer_id');

        this.sql.query('SELECT * FROM tbl_farmers as f LEFT JOIN tbl_personal_detail as p ON f.local_id = p.fm_id WHERE f.local_id = ? limit 1', [this.fm_id]).then( (data) => {

            if (data.res.rows.length > 0) {

                let sqlData = data.res.rows.item(0);
                let formData = [];
                formData['fm_fpo']           = {id :sqlData.fm_fpo};
                formData['fm_fname']         = sqlData.fm_fname;
                formData['fm_fname']         = sqlData.fm_fname;
                formData['fm_mname']         = sqlData.fm_mname;
                formData['fm_lname']         = sqlData.fm_lname;
                formData['fm_mobileno']      = sqlData.fm_mobileno;
                formData['fm_aadhar']        = sqlData.fm_aadhar;

                formData['f1_mfname']        = sqlData.f1_mfname;
                formData['f1_mmname']        = sqlData.f1_mmname;
                formData['f1_dob']           = sqlData.f1_dob;
                formData['f1_age']           = sqlData.f1_age;
                formData['f1_altno']         = sqlData.f1_altno;
                formData['any_other_select'] = sqlData.any_other_select;
                formData['f1_ppno']          = sqlData.f1_ppno;
                formData['f1_pancard']       = sqlData.f1_pancard;
                formData['f1_vote']          = sqlData.f1_vote;
                formData['f1_licno']         = sqlData.f1_licno;
                formData['f1_otherno']       = sqlData.f1_otherno;
                formData['f1_expfarm']       = sqlData.f1_expfarm;
                formData['fm_gender']        = sqlData.fm_gender;
                console.log(formData['fm_gender']);
                this.personal.setValue(formData);
                if (formData['f1_mfname']) {
                    this.exist = true;
                }
            }
        }, err => {
            console.log(err);
        });
    }

    save() {

        this.submitAttempt = true;
        if (!this.personal.valid) {
            console.log("Validation error!")
        } else {
            console.log("success!")
            console.log(this.personal.value);

            let date = new Date();
            let dateNow = date.getTime()/1000|0;
            this.sql.query('UPDATE tbl_farmers SET fm_fpo = ?, fm_fname = ?, fm_mname = ?, fm_lname = ?, fm_mobileno = ?, fm_aadhar  = ?, fm_modifieddt = ?, fm_gender = ? WHERE local_id = ?', [

                this.personal.value.fm_fpo.id,
                this.personal.value.fm_fname,
                this.personal.value.fm_mname,
                this.personal.value.fm_lname,
                this.personal.value.fm_mobileno,
                this.personal.value.fm_aadhar,
                dateNow,
                this.personal.value.fm_gender,
                this.fm_id
            ]).then(data => {
                if (this.exist) {
                    this.sql.query('UPDATE tbl_personal_detail SET f1_mfname = ?, f1_mmname = ?, f1_dob = ?, f1_age = ?, f1_altno  = ?, any_other_select = ?, f1_ppno = ?, f1_pancard = ?, f1_vote = ?, f1_licno = ?, f1_otherno = ?, f1_expfarm = ?, f1_modified_date = ? WHERE fm_id = ?', [

                        this.personal.value.f1_mfname,
                        this.personal.value.f1_mmname,
                        this.personal.value.f1_dob,
                        this.personal.value.f1_age,
                        this.personal.value.f1_altno,
                        this.personal.value.any_other_select,
                        this.personal.value.f1_ppno, 
                        this.personal.value.f1_pancard, 
                        this.personal.value.f1_vote, 
                        this.personal.value.f1_licno, 
                        this.personal.value.f1_otherno, 
                        this.personal.value.f1_expfarm,
                        dateNow,
                        this.fm_id
                    ]).then(data => {
                        console.log(data);
                        this.sql.updateUploadStatus('tbl_personal_detail', this.fm_id, '0');
                        this.sql.updateUploadStatus('tbl_farmers', this.fm_id, '0');
                        this.navCtrl.pop();
                    },
                    err => {
                        console.log(err);
                    });               
                }
                else{
                    this.sql.query('INSERT INTO tbl_personal_detail(fm_id, f1_mfname, f1_mmname, f1_dob, f1_age, f1_altno ,any_other_select, f1_ppno, f1_pancard, f1_vote, f1_licno, f1_otherno, f1_expfarm, f1_created_date, f1_modified_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [

                        this.fm_id,
                        this.personal.value.f1_mfname,
                        this.personal.value.f1_mmname,
                        this.personal.value.f1_dob,
                        this.personal.value.f1_age,
                        this.personal.value.f1_altno,
                        this.personal.value.any_other_select,
                        this.personal.value.f1_ppno, 
                        this.personal.value.f1_pancard, 
                        this.personal.value.f1_vote, 
                        this.personal.value.f1_licno, 
                        this.personal.value.f1_otherno, 
                        this.personal.value.f1_expfarm,
                        dateNow,
                        dateNow
                    ]).then(data => {
                        this.sql.updateUploadStatus('tbl_personal_detail', this.fm_id, '0');
                        this.sql.updateUploadStatus('tbl_farmers', this.fm_id, '0');
                        this.navCtrl.pop();
                    },
                    err => {
                        console.log(err);
                    });
                }
            },
            err => {
                console.log(err);
            });

        }
    }

    //this function will call while leaving the page
    //the function will then call the callback of previous page method
    ionViewWillLeave(){
        let callback = this.navParams.get('callback') || false;
        if(callback){
            callback(true);
        }
    }

    checkMobilePersonal(control: FormControl, _fm_id): any {
        
        return new Promise(resolve => {
            if (control.value) {
                let sql = new Sql;
                sql.query("SELECT fm_mobileno FROM tbl_farmers WHERE fm_mobileno = ? and local_id != ?", [control.value, _fm_id]).then((data) => {
                    if (data.res.rows.length > 0) {
                        resolve({
                            "taken": true
                        });
                    }else{
                        resolve(null);
                    }
                });
            }else{
                resolve(null);
            }
        });
    }

    checkAadharPersonal(control: FormControl, _fm_id): any {
        return new Promise(resolve => {
            if (control.value) {
                let sql = new Sql;
                sql.query("SELECT fm_aadhar FROM tbl_farmers WHERE fm_aadhar = ? and local_id != ?", [control.value, _fm_id]).then((data) => {

                    if (data.res.rows.length > 0) {
                        resolve({
                            "taken": true
                        });
                    }else{
                        resolve(null);
                    }
                });
            }
            else{
                resolve(null);
            }
        });
    }

}
