import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sql } from '../../providers/sql/sql';
import { Helper } from '../../validators/ExtraValidator';
/**
 * Generated class for the KycPhonePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-kyc-phone',
  templateUrl: 'kyc-phone.html',
})
export class KycPhonePage {

    phone: FormGroup;
	submitAttempt: boolean = false;
	fm_id: any;
    exist: boolean = false;

	constructor(public navCtrl: NavController,
				public navParams: NavParams,
                public sql: Sql,
				public toastCtrl: ToastController,
				public formBuilder: FormBuilder){

		this.phone = formBuilder.group({
			'f5_phonetype' : ['', Validators.required],
			// 'f5_any_one_have_smart_phone' : ['', Validators.required],
			'f5_servpro' : [''],
			'f5_network' : [''],
			'f5_datapack' : [''],
			'f5_datapackname' : [''],
			'f5_appuse' : [''],
			// 'f5_app_name' : ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])],
			'f5_farmapp' : [''],
			
		});

		//Listen for form changes
		this.phone.controls['f5_phonetype'].valueChanges.subscribe(() => {
			this.setValidation();
		});

		this.phone.controls['f5_datapack'].valueChanges.subscribe(() => {
			this.setValidation();
		});

	}

	list_f5_phonetype = [
		{id: "smartphone", name: "Smartphone"},
		{id: "featurephone", name: "Featurephone"},
	];

	list_f5_servpro = [
		{id: "aircel", name: "Aircel"},
		{id: "airtel", name: "Airtel"},
		{id: "bsnl", name: "BSNL"},
		{id: "jio", name: "Jio"},
		{id: "relience", name: "Relience"},
		{id: "tata docomo", name: "Tata Docomo"},
		{id: "tata", name: "Tata"},
		{id: "uninor", name: "Uninor"},
		{id: "vodafone", name: "Vodafone"},
		{id: "idea", name: "Idea"},
		{id: "Other", name: "Other"},
	];

	list_f5_network = [
		{id: "yes", name: "Yes"},
		{id: "no", name: "No"},
	];

	list_f5_datapack = [
		{id: "yes", name: "Yes"},
		{id: "no", name: "No"},
	];

	list_f5_datapackname = [
		{id: "2g", name: "2G"},
		{id: "3g", name: "3G"},
		{id: "4g", name: "4G"},
	];

	list_f5_appuse = [
		{id: "yes", name: "Yes"},
		{id: "no", name: "No"},
	];

	list_f5_farmapp = [
		{id: "yes", name: "Yes"},
		{id: "no", name: "No"},
	];


	ionViewDidEnter() {
		console.log('ionViewDidLoad KycPhonePage');

		//update validation here
		this.setValidation();

		this.exist = false;
        this.fm_id = this.navParams.get('farmer_id');

        this.sql.query('SELECT * FROM tbl_applicant_phone WHERE fm_id = ? limit 1', [this.fm_id]).then( (data) => {

            if (data.res.rows.length > 0) {

                let sqlData = data.res.rows.item(0);
                let formData = [];

				formData['f5_phonetype']    = Helper.checkInList(this.list_f5_phonetype, 'id', sqlData.f5_phonetype);
				formData['f5_servpro']      = Helper.checkInList(this.list_f5_servpro, 'id', sqlData.f5_servpro);
				formData['f5_network']      = Helper.checkInList(this.list_f5_network, 'id', sqlData.f5_network);
				formData['f5_datapack']     = Helper.checkInList(this.list_f5_datapack, 'id', sqlData.f5_datapack);
				formData['f5_datapackname'] = Helper.checkInList(this.list_f5_datapackname, 'id', sqlData.f5_datapackname);
				formData['f5_appuse']       = Helper.checkInList(this.list_f5_appuse, 'id', sqlData.f5_appuse);
				formData['f5_farmapp']      = Helper.checkInList(this.list_f5_farmapp, 'id', sqlData.f5_farmapp);

                this.phone.setValue(formData);
                this.exist = true;
            }
		}, err => {
            console.log(err);
        });
	}

	setValidation(){
		let controls = this.phone.controls;
		if(controls['f5_phonetype'].value === 'smartphone'){

			controls['f5_datapack'].enable({ emitEvent: false });
			controls['f5_appuse'].enable({ emitEvent: false });
			// controls['f5_app_name'].enable({ emitEvent: false });
			controls['f5_farmapp'].enable({ emitEvent: false });
		}
		else{
			controls['f5_datapack'].setValue('', { emitEvent: false });
			controls['f5_appuse'].setValue('', { emitEvent: false });
			// controls['f5_app_name'].setValue('', { emitEvent: false });
			controls['f5_farmapp'].setValue('', { emitEvent: false });

			controls['f5_datapack'].disable({ emitEvent: false });
			controls['f5_appuse'].disable({ emitEvent: false });
			// controls['f5_app_name'].disable({ emitEvent: false });
			controls['f5_farmapp'].disable({ emitEvent: false });
		}
	}

	showMessage(message, style: string, dur?: number){
		const toast = this.toastCtrl.create({
	      message: message,
	      showCloseButton: true,
	      duration: dur || 5000,
	      closeButtonText: 'Ok',
	      cssClass: style,
	      dismissOnPageChange: true
	    });

	    toast.present();
	}

	save(){
		this.submitAttempt = true;
		if (this.phone.valid) {
			console.log('success');
			console.log(this.phone.value);

			let date = new Date();
            let dateNow = date.getTime()/1000|0;

            if (this.exist) {
                this.sql.query('UPDATE tbl_applicant_phone SET f5_phonetype = ?, f5_servpro = ?, f5_network = ?, f5_datapack = ?, f5_datapackname = ?, f5_appuse = ?, f5_farmapp = ?,  f5_modified_date = ? WHERE fm_id = ?', [

                    this.phone.value.f5_phonetype || '',
                    this.phone.value.f5_servpro || '',
                    this.phone.value.f5_network || '',
                    this.phone.value.f5_datapack || '',
                    this.phone.value.f5_datapackname || '',
                    this.phone.value.f5_appuse || '',
                    this.phone.value.f5_farmapp || '',

                    dateNow,
                    this.fm_id
                ]).then(data => {
                    this.sql.updateUploadStatus('tbl_applicant_phone', this.fm_id, '0');
                    this.navCtrl.pop();
                },
                err => {
                    console.log(err);
                });               
            }
            else{
                this.sql.query('INSERT INTO tbl_applicant_phone(fm_id, f5_phonetype, f5_servpro, f5_network, f5_datapack, f5_datapackname, f5_appuse, f5_farmapp, f5_created_date, f5_modified_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [

                    this.fm_id,
                    this.phone.value.f5_phonetype || '',
                    this.phone.value.f5_servpro || '',
                    this.phone.value.f5_network || '',
                    this.phone.value.f5_datapack || '',
                    this.phone.value.f5_datapackname || '',
                    this.phone.value.f5_appuse || '',
                    this.phone.value.f5_farmapp || '',
                    dateNow,
                    dateNow
                ]).then(data => {
                    this.sql.updateUploadStatus('tbl_applicant_phone', this.fm_id, '0');
                    this.navCtrl.pop();
                },
                err => {
                    console.log(err);
                });
            }
		}else{
			
			console.log('Validation error');
			this.showMessage("Please fill valid data!", "danger", 100000);
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

}
