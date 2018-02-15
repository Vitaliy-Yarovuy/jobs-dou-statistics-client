import { Component, OnInit} from '@angular/core';
import * as scrapper from 'jobs-dou-statistics-scrapper';
import * as firebaseui from 'firebaseui';
import firebase from '@firebase/app';
import '@firebase/firestore';
import '@firebase/auth';



function loading(target, key, descriptor) {
  if (descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(target, key);
  }
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args) {
    this.loading = true;
    const result = await originalMethod.apply(this, args);
    this.loading = false;
    return result;
  };
}


const config = {

};

firebase.initializeApp(config);
const db = firebase.firestore();


const uploadVacancies = async (vacancies, category) =>{
  const collRef = db.collection("vacancies");
  // Get a new write batch
  const batch = db.batch();

  for(const vacancy of vacancies) {
    vacancy.salary = vacancy.salary || null;
    vacancy.category = category;
    delete vacancy.desc;

    // Set the value of 'NYC'
    const nycRef = collRef.doc(vacancy.id);
    batch.set(nycRef, vacancy);
  }

  return await batch.commit().then(function(el){
    console.log('vacs.add',el);
  });

} 


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';

  categories = [];
  companies = [];
  vacanciesGrabbed = false;

  readonly vacanciesFields = ['id',
    'company',
    'title',
    'href',
    'desc',
    'date',
    'cities',
    'salary'];

  constructor() {}

  ngOnInit(): void {

    // Initialize the FirebaseUI Widget using Firebase.
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    // Disable auto-sign in.
    ui.disableAutoSignIn();


    ui.start('#firebaseui-auth-container', {
      signInOptions: [
        // List of OAuth providers supported.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        signInSuccess: function(user, credential, redirectUrl) {
          if (window.opener) {
            // The widget has been opened in a popup, so close the window
            // and return false to not redirect the opener.
            window.close();
            return false;
          } else {
            // The widget has been used in redirect mode, so we redirect to the signInSuccessUrl.
            return true;
          }
        }
      },

    });

  }


  cutDown(text, count = 50) {
    return text && text.length > count ? text.substr(0, count) + '...' : text;
  }

  @loading
  async initGrab() {
    this.categories = await scrapper.grabCategories();
    this.companies = await scrapper.grabTop10Companies();
    console.log('initGrab end!', this);
  }

  @loading
  async grab() {

    for (const category of this.categories) {
      category.vacancies = await scrapper.grabVacancies(category.name);
      await uploadVacancies(category.vacancies, category.id);
    }
    this.vacanciesGrabbed = true;
    console.log('grab end!');
  }

}
