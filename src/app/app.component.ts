import {ChangeDetectorRef, Component} from '@angular/core';
import * as Scrapper from 'jobs-dou-statistics-scrapper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  categories = [];
  companies = [];

  constructor(private cd: ChangeDetectorRef) {}

  async initGrab() {
    this.categories = await Scrapper.grabCategories();
    this.companies = await Scrapper.grabTop10Companies();
    console.log(this);
  }
}
