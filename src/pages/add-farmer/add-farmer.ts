import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sql } from '../../providers/sql/sql';
import { UserProvider } from '../../providers/user/user';
import { ExtraValidator } from '../../validators/ExtraValidator';
import { Events } from 'ionic-angular';

/**
 * Generated class for the AddFarmerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 * To add farmers
 */

@IonicPage()
@Component({
    selector: 'page-add-farmer',
    templateUrl: 'add-farmer.html',
})
export class AddFarmerPage {
   
    /** Initialized form group name*/
    personal: FormGroup;
    /** Check form is submitted or not*/
    submitAttempt: boolean = false;
    retryButton: boolean = false;
    ca_id: any = "";
    fpos: any = [];

    private storage: Storage;

    constructor(private sql: Sql,
        public navCtrl: NavController,
        public navParams: NavParams,
        public user: UserProvider,
        public events: Events,
        public formBuilder: FormBuilder) {

        //get ca_id
        this.ca_id = this.user.id;
        
        this.personal = formBuilder.group({
            fm_fpo: ['', Validators.required],
            fm_fname: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
            fm_mname: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z0-9 ]*')])],
            fm_lname: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required])],
            fm_mobileno: ['', Validators.compose([Validators.pattern('^[0-9\-]{10}$'), Validators.required]), ExtraValidator.checkMobile],
            fm_aadhar: ['', Validators.compose([Validators.pattern('^[0-9]{12}$'), Validators.required]), ExtraValidator.checkAadhar],
            fm_gender: ['', Validators.required],
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
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AddFarmerPage');
    }

    save() {

        this.submitAttempt = true;
        console.log(this.personal.controls);

        if (!this.personal.valid) {
            console.log("Validation error!")
        } else {

            let date = new Date();
            let dateNow = date.getTime() / 1000 | 0;

            this.sql.query("INSERT INTO tbl_farmers (fm_fpo, fm_caid, fm_fname, fm_mname, fm_lname,fm_gender,fm_mobileno, fm_aadhar, fm_createddt, fm_modifieddt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    this.personal.value.fm_fpo.id,
                    this.ca_id,
                    this.personal.value.fm_fname,
                    this.personal.value.fm_mname,
                    this.personal.value.fm_lname,
                    this.personal.value.fm_gender,
                    this.personal.value.fm_mobileno,
                    this.personal.value.fm_aadhar,
                    dateNow,
                    dateNow
                ])
                .then((data) => {
                    console.log("success!", data);
                    if(data.res.insertId != undefined){
                        this.events.publish('table:farmerAdded', data.res.insertId);
                    }

                    let callback = this.navParams.get("callback") || false;
                    if (callback) {
                        callback(true).then(() => {
                            this.navCtrl.pop();
                        });
                    }
                    else {
                        this.navCtrl.setRoot('FarmersPage');
                    }

                }, (error) => {
                    console.log(error);
                });
        }
    }
}
