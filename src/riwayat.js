// import React, {Component} from 'react';
// import {Platform, StyleSheet, Text,
//   View,TouchableOpacity, AsyncStorage,
// } from 'react-native';

// export default class App extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       users:''
//     };
//   }
//   componentDidMount(){
//     AsyncStorage.getItem('user')

//     .then(value => {
//       if(value != null){
//         this.setState({users : value })}
//       }
//     )
//     }
//   render() {
//     return (
//       <View style={styles.container}>
//         <Text>
//           {this.state.users}
//         </Text>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//   },
// });

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  PixelRatio,
  TouchableOpacity,
  Image,
  AsyncStorage
} from 'react-native';


import ImagePicker from 'react-native-image-picker';

// ---FYI---

// Replace the API URI in the fetch methods of both image and video with your own API URI

// Repo includes an example server API "./API/upload.php", feel free to use your own one though
// If you use my "upload.php", go check the FYI included in "upload.php"

// Tested only on Android yet, iOS support will follow later on, pm me if needed

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      avatar: null,
      videoSource: null,
      uploadState: 'No upload currently active.',
      databaseEntryState: null,
    };
  }


  componentDidMount(){
    AsyncStorage.getItem('avatar')
    .then(value => {
      if(value != null){
        this.setState({avatar : value })}
      }
    )
  }

  // ---Image upload---
  // Options passed to ImagePicker.showImagePicker
  selectPhotoTapped() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
      },
    };
    // ImagePicker invoked, picking an image
    ImagePicker.showImagePicker(options, (response) => {
      // Logging various errors/ cancels for the ImagePicker
      console.log('ImagePicker response: ', response);
      if (response.didCancel) {
        console.log('User cancelled ImagePicker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        // Saving the URI from response as a variable and a state (state is used in render)
        const source = { uri: response.uri };
        this.setState({
          avatarSource: source,
        });
        // fetch needs the source as a string, but "source" is an object
        const sourceAsString = 'data:image/jpeg;base64,';;
        console.log('sourceAsString = ', sourceAsString);

        // For storing the file on a server we cut of the filename and its
        // extension from the file URI
        const fileName = sourceAsString.split('/').pop();
        console.log('filename = ', fileName);

        // Creating new FormData for the image upload
        const data = new FormData();
        data.append('data', {
          uri: sourceAsString,
          type: 'image/jpeg',
          name: fileName,
        });
        // fetch "POST", upload the image
        // replace below once with your own API URI
        fetch('https://memoria.serveo.net/avatar/edit', {
          method: 'PUT',
          body: data,
        },
        this.setState({
          uploadState: 'Uploading... please be patient.',
        }),
        )
        // Checking the HTTP response and adjusting uploadState
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            this.setState({
              uploadState: 'Upload finished.',
            });
          } else {
            const responseStatusString = res.status.toString();
            console.log('responseStatusString: ', responseStatusString);
            const networkError = 'An error occured during uploading, errorcode: ' + responseStatusString;
            console.log('networkError: ', networkError);
            this.setState({
              uploadState: networkError,
            });
          }
        })
        // Logging any networking errors
        .catch((error) => {
          console.log('An error occured during networking: ', error);
        });

        // Create a DB entry for the image
        const dbData = new FormData();
        dbData.append(
          'fileName', fileName,
        );
        dbData.append(
          'uploaderID', '1',
        );
        dbData.append(
          'fileType', 'image',
        );
        

        }
    })
  };
 

  render() {
    // Stylesheet
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
      },
      avatarContainer: {
        borderColor: '#9B9B9B',
        borderWidth: 1 / PixelRatio.get(),
        justifyContent: 'center',
        alignItems: 'center',
      },
      ava: {

        width: 150,
        height: 150,
      },
    });

    return (
      <ScrollView>
        <View style={styles.container}>

          <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)}>
            <View style={[styles.ava, styles.avatarContainer, { marginBottom: 20 }]}>
              { this.state.avatar === null ? <Text>Select a Photo</Text> :
              <Image style={styles.ava} source={this.state.avatar} />
              }
            </View>
          </TouchableOpacity>
          <Text>{this.state.uploadState}</Text>
          <Text>{this.state.databaseEntryState}</Text>

          <TouchableOpacity >
            <View style={[styles.ava, styles.avatarContainer]}>
              { this.state.videoSource === null ? <Text>Select a Video</Text> :
              <Text>{ this.state.videoSource }</Text>
              }

            </View>
          </TouchableOpacity>

          <Text>Hint: The video preview only shows the video uri yet. </Text>
          <Text>Hint 2: Maximum supported filesize in upload.php is set to 100 Mb
           (feel free to change that or delte this rule).
           No error is displayed yet, if the filesize exceeds that size. Upload will finish
           without error, but file doesnt appear on server. Going to be fixed someday.
            Probably needs base64 implementation. </Text>

        </View>
      </ScrollView>
    );
  }
}

// TODO
// ImagePicker dependencies for iOS
// Test with other file formats then .jpeg and .mp4