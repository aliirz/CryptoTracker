import { Component, OnInit, ChangeDetectorRef, ViewRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpService } from './http.service';
import { config } from '../config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private data = config.data;
  private investedCapital: number = 0;
  private currentCapital: number = 0;
  private statusList: Array<any> = [];

  constructor(private http: HttpService, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    let me = this;
    me.getInvestedCapital(me.data);
    me.getAllResults();
    // Update data every 10 seconds
    setInterval(function(){
      me.statusList = [];
      me.getAllResults();
    }, 10000);
  }

  getAllResults() {
    let prom, me = this;
    for (let i = 0; i < me.data.length; i++) {
      prom = me.http.retreiveData(me.data[i].currency);
      prom = prom.then(res => {
        let status = {
          name: res[0].name,
          percent_change_1h: res[0].percent_change_1h,
          percent_change_24h: res[0].percent_change_24h,
          percent_change_7d: res[0].percent_change_7d,
          price: res[0].price_usd,
          symbol: res[0].symbol,
          amount: me.data[i].amount,
          investedCapital: me.data[i].investedCapital
        };
        status['currentCapital'] = status.amount * (parseFloat(status.price));
        status['capitalDifference'] = status['currentCapital'] - status.investedCapital;
        me.statusList = me.statusList.concat(status);
        return me.http.retreiveData(me.data[i].currency);
      });
    }
    return prom.then(res => {
      me.statusList.concat(res);
      console.log('RES', me.statusList);
      me.statusList.sort(function(a, b) {
        return parseFloat(b.currentCapital) - parseFloat(a.currentCapital);
    });
      me.calculateCurrentCapital(me.statusList);
      me.ref.detectChanges();
    });
  }

  getInvestedCapital(data): void {
    data.forEach(el => {
      this.investedCapital += el.investedCapital;
    })
    console.log('Invested:', this.investedCapital);
  }

  calculateCurrentCapital(data): void {
    // check if all data have been retreived
    if(data.length != this.data.length) {
      return;
    }
    this.currentCapital = 0;
    data.forEach(el => {
      this.currentCapital += el.currentCapital;
    })
    console.log('CurrentCapital:', this.currentCapital);
  }
}
