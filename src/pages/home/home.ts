import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController , LoadingController, Platform } from 'ionic-angular';
import {GoogleMap, GoogleMaps, GoogleMapsEvent, LatLng,MarkerOptions,Marker} from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
// import { Geofence } from '@ionic-native/geofence';
// import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map') mapElement:ElementRef;
  gmap:GoogleMap;

  //locations
  myLocation : LatLng;
  parkingLocation: LatLng;
  //geolocation
  watch : any;
  // geolocation : Geolocation;
  //map
	myMarker:Marker;
	carMarker:Marker;
  gmapready:boolean;

  alertPro:any;
  splash:any;
   //wtf mode
  // parkFlag:boolean;
  located:any;
  // stora:any;
	loading : any;
	// geofence : Geofence;
  constructor( public navCtrl: NavController,public loadingCtrl: LoadingController, public alerCtrl: AlertController, private splashScreen: SplashScreen, private plt: Platform, private _geoloc: Geolocation) {
		// this.geolocation = new Geolocation;
    this.gmapready=false;
		// this.geofence = new Geofence;
		// this.stora = this.storage;
    this.alertPro=alerCtrl;
    this.splash=this.splashScreen;
    this.located=false;
		this.presentLoadingDefault();

	}

	ionViewDidLoad() {
    console.log("|ngAfterViewInit");
    this.splash.hide();
    this.initmap();
	}


  initmap() {
    let element = this.mapElement.nativeElement;
    this.gmap = GoogleMaps.create(element);
    this.gmap.one(GoogleMapsEvent.MAP_READY).then(()=>{
      this.plt.ready().then(()=>{
        console.log("|PLATFORM READY!");
        let mocloc = new LatLng(35.098765, 24.123456);
        let myMarkerOptions3: MarkerOptions = {
          position: mocloc,
          title: 'You are here!',
          // icon: 'http://www.bedroomjoys.com/uploaded/thumbnails/rocks-off-little-cocky-passionate-dildo-pink_24535_700x700.jpg'
          icon : 'assets/markers/car.png'
        };
        this.createMarker(myMarkerOptions3);
        // }).catch((err)=>{console.log("||Error Getting Location!");console.log(err);});
      });
    });
  }

  getLocation(){
    // this.plt.ready().then(()=>{
    //   console.log("READY!");
      return this._geoloc.getCurrentPosition();
    // });
  }

  moveCamera(loc: LatLng) {
	// move the map's camera to position
		this.gmap.animateCamera({
		  'target': loc,
		  'tilt': 30,
		  'zoom': 17,
		  'bearing': 140
		});
    console.log(this.gmap);
  }

  createMarker(opt: MarkerOptions){
    console.log("|||set Marker options");
		this.gmap.addMarker(opt).then((marker: Marker)=>{
      console.log("||||Marker added!");
			this.myMarker = marker;
      this.myMarker.setVisible(false);
      console.log("|||||Should be Calling geobserve");
			this.geObserve();
		}).catch((err)=>{console.log("~~~~Error Adding Marker!!!");console.log(err);});
  }

  geObserve(){
    this.watch = this._geoloc.watchPosition();
    this.watch.subscribe((pos) => {
      console.log("|||||I AM WATCHING YOU");
      // create LatLng object
      this.located=true;
      this.myLocation = new LatLng(pos.coords.latitude,pos.coords.longitude);
      this.myMarker.setPosition(this.myLocation);
      if (!this.myMarker.isVisible()){
        console.log("Marker was not Visible");
        this.myMarker.setVisible(true);
  			this.myMarker.showInfoWindow();
        this.moveCamera(this.myLocation);
        // this.myMarker.setIcon({url: 'www/assets/markers/car.png'});
      }else{console.log('Marker was already visible');}
    });
  }


	// loadMap() {
  //   console.log("Get element by id");
	// 	this.element = document.getElementById('map');
  //   console.log(this.element);
	// 	this.gmap = new GoogleMap(this.element);
  //
  //   this.gmap.one(GoogleMapsEvent.MAP_READY).then(()=>{
  //     console.log("Map is Ready!");
  //     this.gmapready=true;
  //
  // 		this.geolocation.getCurrentPosition().then((pos) => {
  // 			this.myLocation = new LatLng(pos.coords.latitude,pos.coords.longitude);
  //       console.log("Getting Location");
  //       console.log(this.gmap);
  //


  			// //previous car marker
  			// if(this.parkingLocation != null){
  			// 	//Search for previously stored location
  			// 	let myMarkerOptions1: MarkerOptions = {
  			// 		position: this.parkingLocation,
  			// 		title: 'You parked here!',
  			// 		icon: 'www/assets/markers/car.png'
  			// 	};
  			// 	this.gmap.addMarker(myMarkerOptions1).then((marker)=>{
  			// 		this.carMarker = marker;
  			// 	});
        //
  			// 	//mymarker
  			// 	let myMarkerOptions2: MarkerOptions = {
  			// 		position: this.myLocation,
  			// 		title: 'You are here!',
  			// 		icon:'www/assets/markers/male-2.png'
  			// 	};
        //
  			// 	this.gmap.addMarker(myMarkerOptions2).then((marker)=>{
  			// 		this.myMarker = marker;
  			// 		this.myMarker.showInfoWindow();
  			// 	}).then(()=>{
  			// 		this.geObserve();
  			// 	});
        //
  			// }else{
  // 				console.log("Null Parking Location ");
  //
  // 			// }
  // 		}).catch((error) => {
  // 		  console.log('Error getting location', error);
  //         this.located=false;
  // 		});
	// 	});
	// }

// 	//// just geofence things    ////////////////
//
// 	addGeofence() {
// 	  //options describing geofence
// 	  let fence = {
// 		id: '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdb', //any unique ID
// 		latitude:       37.285951, //center of geofence radius
// 		longitude:      -121.936650,
// 		radius:         100, //radius to edge of geofence in meters
// 		transitionType: 3, //see 'Transition Types' below
// 			notification: { //notification settings
// 				id:             1, //any unique ID
// 				title:          'You crossed a fence', //notification title
// 				text:           'You just arrived to Gliwice city center.', //notification body
// 				openAppOnClick: true //open app when notification is tapped
// 			}
// 		}
//
// 		this.geofence.addOrUpdate(fence).then(() => console.log('Geofence added'),
// 			(err) => console.log('Geofence failed to add')
// 		);
//
// 	}
//
//
//
//
//
//
	/////////////////////////////////////////


	// iParkedHere(){
	// 	this.presentLoadingDefault();
	// 	this.loading.present().then;
	// 	this.geolocation.getCurrentPosition().then((pos) => {
	// 				this.parkingLocation = new LatLng(pos.coords.latitude,pos.coords.longitude);
	// 				// this.stora.set('parkingCoords',this.parkingLocation);
	// 				this.myMarker.remove();
  //
	// 				//mymarker
	// 				let myMarkerOptions2: MarkerOptions = {
	// 					position: this.myLocation,
	// 					title: 'You are here!',
	// 					icon:'www/assets/markers/male-2.png'
	// 				};
  //
	// 				this.gmap.addMarker(myMarkerOptions2).then((marker)=>{
	// 					this.myMarker = marker;
	// 				});
	// 				let myMarkerOptions1: MarkerOptions = {
	// 					position: this.parkingLocation,
	// 					title: 'You parked here!',
	// 					icon: 'www/assets/markers/car.png'
	// 				};
	// 				this.gmap.addMarker(myMarkerOptions1).then((marker)=>{
	// 					this.carMarker = marker;
	// 				}).then(()=>{
	// 					if(this.loading){this.loading.dismiss();}
  //
	// 					});
	// 	}).catch((error) => {
	// 	  console.log('Error getting location', error);
  //     if(this.loading){this.loading.dismiss();this.located=false;}
	// 	});
  //
	// }
// 	UnParked(){
//
//     if (this.parkingLocation!=null){
//   		this.stora.set('parkingCoords',null).then(()=>{
//   			console.log("Cache Clean");
//   		},(err) => {
//   			console.log("Problemz with Storagezzzzz");
//   		});
//       this.parkingLocation=null;
//   		this.carMarker.remove();
// 		this.myMarker.remove();
//
// 				//mymarker
// 				let myMarkerOptions3: MarkerOptions = {
// 					position: this.myLocation,
// 					title: 'You are here!',
// 					icon:'www/assets/markers/car.png'
// 				};
//
// 				this.gmap.addMarker(myMarkerOptions3).then((marker)=>{
// 					this.myMarker = marker;
// 				});
//
//   		console.log("Map Clean");
//     }else{
//       let alert = this.alertPro.create({
//         title: 'Hey There!',
//         subTitle: 'Seems we have no clue where you parked your Intergalactic Unicorn!\n Try that way -> ',
//         buttons: ['OK']
//       });
//       alert.present();
//     }
// 	}
//
// ///ALERT/////////////////////////////////
//
//   doConfirm() {
//     if (this.parkingLocation!=null){
//       let confirm = this.alertPro.create({
//         title: 'Use this lightsaber?',
//         message: 'Do you agree to use this lightsaber to do good across the intergalactic galaxy?\n It is going to delete your last Parking Location Foreverrrr!',
//         buttons: [
//           {
//             text: 'Nice',
//             handler: () => {
//               this.UnParked();
//               this.iParkedHere();
//             }
//           },
//           {
//             cssClass:'alert-danger',
//             text: 'Oh Fuck',
//             handler: () => {
//             }
//           }
//         ]
//       });
//       confirm.present()
//     }else{
//       this.iParkedHere();
//     }
//   }
// //////////SEARCH///////////////////
//   search(target){
//     let searchtarget=null;
//     if(target == 0){
//       searchtarget=this.myLocation; console.log("locating person");}
//     else{ searchtarget=this.parkingLocation; console.log("locating car");}
//     if( this.gmap && searchtarget ){
//       console.log("target location: "+ searchtarget);
//       this.gmap.animateCamera({
//           'target': searchtarget,
//           'tilt': 30,
//           'zoom': 17,
//           'bearing': 140
//       });
//     }else{console.log("Null map or target\n" + this.gmap+"--"+searchtarget);}
//   }

 ////////LOADING         ////////////////////////////////////////////
	presentLoadingDefault() {
	  this.loading = this.loadingCtrl.create({
		content: 'Memorizing in your stead...'
	  });
	}
}
