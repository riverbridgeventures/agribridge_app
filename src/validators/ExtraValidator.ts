import { FormControl, FormGroup } from '@angular/forms';
import { Sql } from '../providers/sql/sql';

export class ExtraValidator {


    static checkMobile(control: FormControl): any {

        return new Promise(resolve => {
            if (control.value) {
                let sql = new Sql;
                sql.query("SELECT fm_mobileno FROM tbl_farmers WHERE fm_mobileno = ?", [control.value]).then((data) => {

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

    static checkAadhar(control: FormControl): any {

        return new Promise(resolve => {
            if (control.value) {
                let sql = new Sql;
                sql.query("SELECT fm_aadhar FROM tbl_farmers WHERE fm_aadhar = ?", [control.value]).then((data) => {
                    if (data.res.rows.length > 0) {
                        resolve({
                            "taken": true
                        });
                    }
                    else{
                        resolve(null);
                    }
                });
            }else{
                resolve(null);
            }
            
        });
    }

}

export class Helper {

    static checkInList(list:Array<any>, key:string, val:string){

        if(list != undefined){
                
            let value = '';
            if(list.length > 0){
                if(list[0][key] != undefined){
                    list.find((v) => {
                        if(val.toLowerCase() === v[key].toLowerCase() ){
                            value = val;
                            return true;
                        }
                    });
                }else{
                    console.error("The provided list dose not have any key named \"" + key + "\"");
                }
            }
            value ? console.log('checkInList- The string "', val, '" Found in ', list):
                    console.warn('checkInList- The string "', val, '" Not found in', list);
            return value;

        }else{
            console.error("The provided list in checkInList(list....) is undefined");
            return '';
        }
    }
}