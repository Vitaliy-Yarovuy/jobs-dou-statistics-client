import { Component} from '@angular/core';
import * as scrapper from 'jobs-dou-statistics-scrapper';


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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
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
      category.vacancies = await scrapper.grabVacancies(category.id);
    }
    this.vacanciesGrabbed = true;
    console.log('grab end!');
  }

}
