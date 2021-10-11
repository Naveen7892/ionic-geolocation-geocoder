/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable curly */
/* eslint-disable prefer-const */
// home.page.ts
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from '@ionic-native/native-geocoder/ngx';

declare let google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: any;
  address: string;

  latitude: number;
  longitude: number;

  debugMessage: string;

  constructor(
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder
  ) {
    // setInterval(() => {
    //   this.geolocation.getCurrentPosition().then((resp) => {
    //     console.log(JSON.stringify(resp));
    //     this.latitude = resp.coords.latitude;
    //     this.longitude = resp.coords.longitude;
    //     console.log(this.latitude, this.longitude);
    //     this.debugMessage = `Location: ${this.latitude}, ${this.longitude}`;
    //   });
    // }, 2000);
  }

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {
    this.geolocation
      .getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 2000,
        maximumAge: 0
      })
      .then((resp) => {
        console.log(JSON.stringify(resp));
        this.debugMessage = `Location: ${JSON.stringify(resp.coords)}`;
        this.latitude = resp.coords.latitude;
        this.longitude = resp.coords.longitude;
        console.log(this.latitude, this.longitude);
      })
      .catch((error) => {
        console.log('Error getting location', error);
        alert("Using fallback API");

        // fallback geolocation access through external API
       fetch('https://ipinfo.io/geo?token=b522c30f78fe74').then(res => {
        res.json().then(data => {
          console.log(data);
           let loc = data.loc.split(',');
           let coords = {
               latitude: loc[0],
               longitude: loc[1]
           };
           console.log(loc);
           this.latitude = coords.latitude;
           this.longitude = coords.longitude;
          //  this.getAddress(this.latitude, this.longitude);
          this.afterGeoLocation();
        });
      });
    });
  }

  afterGeoLocation() {
    let latLng = new google.maps.LatLng(this.latitude, this.longitude);
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.getAddressFromCoords(this.latitude, this.longitude);

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.map.addListener('dragend', () => {
      this.latitude = this.map.center.lat();
      this.longitude = this.map.center.lng();
      this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng());
    });
  }

  getAddressFromCoords(lattitude, longitude) {
    // eslint-disable-next-line @typescript-eslint/quotes
    console.log('getAddressFromCoords ' + lattitude + ' ' + longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5,
    };

    this.nativeGeocoder
      .reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        // eslint-disable-next-line @typescript-eslint/quotes
        this.address = '';
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if (value.length > 0) responseAddress.push(value);
        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value + ', ';
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) => {
        this.address = 'Address Not Available!';
      });
  }
}
