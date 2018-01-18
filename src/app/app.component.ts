import {ChangeDetectorRef, Component} from '@angular/core';
import * as scrapper from 'jobs-dou-statistics-scrapper';


function loading(target, key, descriptor) {
  if(descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(target, key);
  }
  const originalMethod = descriptor.value;

  descriptor.value = async function(...args){
    this.loading = true;
    const result = await originalMethod.apply(this, args);
    this.loading = false; 
    return result;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  categories = [];
  companies = [];
  vacanciesByCompany = {}

  constructor(private cd: ChangeDetectorRef) {}

  @loading
  async initGrab() {
    this.categories = await scrapper.grabCategories();
    this.companies = await scrapper.grabTop10Companies();
    console.log('initGrab end!');
  }

  @loading
  async grab() {
    const populateCategories = await scrapper.populateCategories(this.categories);

    for(const company of this.companies){
        this.vacanciesByCompany[company.id] = await scrapper.grabVacancies(company.id, populateCategories);
    }
    console.log('initGrab end!');
  }


}
