import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController , LoadingController, Platform } from 'ionic-angular';
import {GoogleMap, GoogleMaps, GoogleMapsEvent, LatLng,MarkerOptions,Marker} from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  //map
  @ViewChild('map') mapElement:ElementRef;
  gmap:GoogleMap;

  //marker Stuff
	myMarker:Marker;
	carMarker:Marker;
  manMarker:Marker;
  gmapready:boolean;

  //locations
  watch : any;
  myLocation : LatLng;
  parkingLocation: LatLng;


  // UI stuff
  alertPro:any;
  splash:any;
  locind:Element;
  //bools
  parkFlag:any;
  located:any;
	loading : any;

  constructor( public navCtrl: NavController,public loadingCtrl: LoadingController, public alerCtrl: AlertController, private splashScreen: SplashScreen, private plt: Platform, private _geoloc: Geolocation, private stora: Storage) {
    this.gmapready=false;
    this.alertPro=alerCtrl;
    this.splash=this.splashScreen;
    this.located=false;
    this.parkingLocation=null;
    this.parkFlag=false;

	}

	ionViewDidLoad() {
    console.log("|ViewDidLoad");
    this.plt.ready().then(()=>{
      console.log("|DEVICE READY");
      this.splash.hide();
      this.initmap();
      //Storage Lookup
      this.stora.ready()
      .then(()=>{
        console.log("|Storage Ready");
        this.stora.get('parkingCoords')
        .then((coords)=>{
          console.log("|Got Coords From Storage");
          console.log(coords);
          this.parkingLocation=coords;
          if (coords!=null) {this.parkFlag=true;}
        }).catch((err)=>{console.log("~Error getting coords");});
      }).catch((err)=>{console.log("~Error Opening storage");});
    });

    //location indicator
    this.locind=document.getElementById('locationindicator');

	}

  moveCamera(loc: LatLng) {
    if(this.gmap){
  		this.gmap.animateCamera({
  		  'target': loc,
  		  'tilt': 30,
  		  'zoom': 17,
  		  'bearing': 140
  		});
    }
  }

  initmap() {
    //Git Test
    let element = this.mapElement.nativeElement;
    this.gmap = GoogleMaps.create(element);
    this.gmap.one(GoogleMapsEvent.MAP_READY).then(()=>{
      console.log("|Map  READY!");

      let carloc = new LatLng(35.098765, 24.123456);
      let carstr = 'You are here';
      let mocloc = new LatLng(35.098765, 24.123456); //Man Marker

      //create Car Marker/
      this.createMarker(carloc,carstr,'assets/markers/car.png')
      .then((marker: Marker)=>{
        console.log("Car marker Resolved!");
        this.carMarker=marker;
        this.carMarker.setVisible(false);
        if (this.parkingLocation != null){
          //Parking location is stored. Resolve Parked position
          this.carMarker.setPosition(this.parkingLocation);
          this.carMarker.setVisible(true);
          console.log("Parking Location Stored");
        }else{
          console.log("null parking location");
          //No parking location stored. User moving on car
    			this.myMarker = marker;
          this.myMarker.setVisible(false);
          console.log("|||||Calling geobserve");
          this.geObserve();
        }
      }).catch((err)=>{console.log(err);});

      //Create Man Marker
      this.createMarker(mocloc,'You are here!','assets/markers/male-2.png')
      .then((marker: Marker)=>{
        console.log("Man marker Resolved!");
        this.manMarker= marker;
        if (this.parkingLocation != null){
          //Parking location stored. User is moving on foot
    			this.myMarker = marker;
          this.myMarker.setVisible(false);
          console.log("|||||Calling geobserve");
          this.geObserve();
        }else{
          //No parking location stored. User moving on car - Hide Man marker
          this.manMarker.setVisible(false);
          console.log('User is moving with car');
        }
      }).catch((err)=>{console.log(err);});

    });
  }

  createMarker(pos: LatLng, tit: string, ico: string) {
    let prom = new Promise((resolve, reject) =>{
      let opt: MarkerOptions = {
        position: pos,
        title: tit,
        icon : ico
      };
      console.log("|||Creating Marker");
  		this.gmap.addMarker(opt)
      .then((marker: Marker)=>{
        console.log("||||Marker added!");
        resolve(marker);
  		}).catch((err)=>{console.log("~~~~Error Adding Marker!!!");console.log(err);reject(err);});
    });
    return prom;
  }

  geObserve(){
    this.watch = this._geoloc.watchPosition();
    this.watch.subscribe((pos) => {
      console.log("|||||I AM WATCHING YOU");
      this.myLocation = new LatLng(pos.coords.latitude,pos.coords.longitude);
      this.myMarker.setPosition(this.myLocation);
      this.applyLocAnimation();
      if (!this.myMarker.isVisible()){
        console.log("Marker was not Visible");
        this.myMarker.setVisible(true);
  			this.myMarker.showInfoWindow();
        this.moveCamera(this.myLocation);
        this.located=true;
      }

      // if (this.locind.classList.contains('run-animation')){this.locind.classList.remove('run-animation');}
      // this.locind.classList.add('run-animation');
    });
  }

	iParkedHere(){
		this.presentLoadingDefault('Memorizing in your stead...');
		this.loading.present();
		this._geoloc.getCurrentPosition().then((pos) => {
			this.parkingLocation = new LatLng(pos.coords.latitude,pos.coords.longitude);
			this.stora.set('parkingCoords',this.parkingLocation);
      this.parkFlag=true;
      console.log(this.parkingLocation);
      if(this.loading){this.loading.dismiss();}
      this.carMarker.setPosition(this.parkingLocation);
      this.carMarker.setTitle('You Parked here');
      this.carMarker.setVisible(true);
      this.manMarker.setPosition(this.parkingLocation);
      this.myMarker=this.manMarker;
      this.myMarker.setVisible(true);
		}).catch((error) => {
		  console.log('Error getting location', error);
      if(this.loading){this.loading.dismiss();this.located=false;}
		});
	}


	UnParked(){
		this.presentLoadingDefault('Spreading the love...');
    this.loading.present();
		this._geoloc.getCurrentPosition().then((gpos) => {
      console.log("Got location");
      this.manMarker.setVisible(false);
      this.carMarker.setVisible(false);
      let curpos = new LatLng(gpos.coords.latitude, gpos.coords.longitude);
      this.myMarker=this.carMarker;
      this.myMarker.setPosition(curpos);
      this.myMarker.setTitle('You are here');
      this.myMarker.setVisible(true);
      if(this.loading){this.loading.dismiss();}
    }).catch((error) => {
	    console.log('Error getting location', error);
      if(this.loading){this.loading.dismiss();this.located=false;}
		});
    //clean cache
    this.stora.set('parkingCoords',null).then(()=>{
      console.log("Cache Clean");
    },(err) => {
      console.log("Problemz with Storagezzzzz");
    });
    this.parkingLocation=null;
    this.parkFlag=false;
	}


  search(target){
    let searchtarget=null;
    if(target == 0){ searchtarget = this.myLocation; console.log("locating person");}
    else{ searchtarget = this.parkingLocation; console.log("locating car");}
    if( this.gmap && searchtarget ){
      console.log("target location: "+ searchtarget);
      this.gmap.animateCamera({
          'target': searchtarget,
          'tilt': 30,
          'zoom': 17,
          'bearing': 140
      });
    }else{console.log("Null map or target\n" + this.gmap+"--"+searchtarget);}
  }

  applyLocAnimation(){
    let clone = this.locind
    clone.classList.add('run-animation');
    this.locind.parentNode.replaceChild(clone, this.locind);
  }

 ////////LOADING         ////////////////////////////////////////////
	presentLoadingDefault(cont:string) {
    this.loading = this.loadingCtrl.create({
		content: cont
	  });
	}
}
