import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
/*
  Generated class for the UserProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UserProvider {

    id: string = '';
    fname: string = '';
    emailId: string = '';
    userType: string = '';
    token: string = '';
    contactno: string = '';
    token_expiry: string = '';

    constructor(private storage: Storage){
    	this.storage.get('user_data').then(val => {
            if(val){
                this.setUser(
                    val.id,
                    val.fname,
                    val.emailId,
                    val.userType,
                    val.token,
                    val.contactno,
                    val.token_expiry
                );
            }
        });
    }
    
    public setUser(id: string, name: string, email: string, userType: string, token: string, contactno: string, token_expiry: string) {
        this.id = id;
        this.fname = name;
        this.emailId = email;
        this.userType = userType;
        this.token = token;
        this.contactno = contactno;
        this.token_expiry = token_expiry;
    }

}