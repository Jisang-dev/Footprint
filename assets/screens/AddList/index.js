import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

import DraggableFlatList from "react-native-draggable-flatlist"; /// important!!!

import ImagePicker from 'react-native-image-crop-picker';
import { Picker } from '@react-native-community/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, CheckBox, ListItem } from 'react-native-elements';

import auth from '@react-native-firebase/auth';
import { InterstitialAd, TestIds } from '@react-native-firebase/admob';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

const adBannerUnitId = __DEV__ ? TestIds.BANNER : 
    (Platform.OS == 'ios' 
    ? 'ca-app-pub-1477690609272793/3050510769' 
    : 'ca-app-pub-1477690609272793/8274029234');

const adInterstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : 
    (Platform.OS == 'ios' 
    ? 'ca-app-pub-1477690609272793/3775880012' 
    : 'ca-app-pub-1477690609272793/9626786110');

const interstitial = InterstitialAd.createForAdRequest(adInterstitialUnitId);

export default class AddList extends Component {
    state = {
        category: 'Travel',
        viewmode: 'Map',
        locationChecked: true,
        dateChecked: true,
        date: new Date(),
        show: false,
        data: [],
        link: '',
        title: '',
        subtitle: '',
        thumbnail: '',
        loading: false,
    };

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item, index, drag, isActive }) => (
      <ListItem
        title={item.title}
        titleStyle={{ fontWeight: 'bold' }}
        subtitle={item.subtitle}
        leftAvatar={{ source: { uri: item.photo }, rounded: false}}
        onLongPress={drag}
        bottomDivider
        onPress={() => { 
            var updateData = this.state.data;
            updateData.splice(index, 1);
            this.setState({data: updateData})
        }}
      />
    )

    async componentDidMount() {
        if (!interstitial.loaded) {
            interstitial.load();
        }
    }
    
    render() {
        return(
            <SafeAreaView style={styles.container}>
                {this.state.loading ? 
                <View style={styles.buttonContainer}>
                    <ActivityIndicator size="large" color="#002f6c" />
                    <Text> The more pictures you have, the more time it can take to upload. </Text> 
                    /* 사진이 많을수록 업로드 시간이 오래걸립니다.
                    */ 
                </View>
                : <ScrollView 
                    contentContainerStyle={styles.viewContainer}
                    style={{flex: 1, width: "100%"}}
                >
                    <View style={{height: 200, width: 100, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                        <Text> Category </Text>
                        // 카테고리
                        <Picker
                            selectedValue={this.state.category}
                            style={{width: 130}}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({category: itemValue})
                            }>
                            <Picker.Item label="Travel" value="Travel" /> //여행
                            <Picker.Item label="Daily Life" value="Daily Life" /> //일상
                            <Picker.Item label="Entertainment" value="Entertainment" /> //여가
                            <Picker.Item label="Sports" value="Sports" /> //스포츠
                            <Picker.Item label="News" value="News" /> //뉴스
                            <Picker.Item label="Education" value="Education" /> //교육
                            <Picker.Item label="Other" value="Other" /> //기타
                        </Picker>
                        <Text> View Mode </Text>
                        <Picker
                            selectedValue={this.state.viewmode}
                            style={{width: 90}}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({viewmode: itemValue})
                            }>
                            <Picker.Item label="Map" value="Map" />  //지도
                            <Picker.Item label="List" value="List" /> //목록
                            <Picker.Item label="Grid" value="Grid" />
                        </Picker>
                    </View>
                    <Text
                        onPress={() => this.setState({show: !this.state.show})}
                    > 
                        {this.state.date.toString()} 
                    </Text> 
                    {this.state.show && <DateTimePicker
                        style={{width: "110%"}}
                        mode="date" //날짜
                        value={this.state.date}
                        is24Hour={true}
                        display="default" 
                        onChange={ (event, selectedDate) => {
                            var currentDate = selectedDate || new Date();
                            if (Platform.OS === 'android') {
                                currentDate.setHours(this.state.date.getHours(), this.state.date.getMinutes(), this.state.date.getSeconds());
                                this.setState({
                                    show: false,
                                });
                            }
                            this.setState({
                                date: currentDate,
                            });
                        }}
                    />}
                    {this.state.show && <DateTimePicker
                        style={{width: "110%"}}
                        mode="time" //시간
                        value={this.state.date}
                        is24Hour={true}
                        display="default"
                        onChange={ (event, selectedDate) => {
                            const currentDate = selectedDate || new Date();
                            if (Platform.OS === 'android') {
                                this.setState({
                                    show: false,
                                });
                            }
                            this.setState({
                                date: currentDate,
                            });
                        }}
                    /> }
                    <View style={styles.cellView}>
                        <Input
                            onChangeText = {(title) => this.setState({title})}
                            inputStyle={styles.inputs}
                            maxLength={40}
                            placeholder='Title' //제목
                            placeholderTextColor="#bdbdbd"
                            leftIcon={
                                <Icon
                                    name='title'
                                    size={24}
                                    color='#002f6c'
                                />
                            }
                        />
                    </View>
                    <View style={styles.cellView}>
                        <Input
                            multiline
                            onChangeText = {(subtitle) => this.setState({subtitle})}
                            inputStyle={styles.inputs}
                            maxLength={140}
                            placeholder='Subtitle' //부제목
                            placeholderTextColor="#bdbdbd"
                            leftIcon={
                                <Icon
                                    name='subtitles'
                                    size={24}
                                    color='#002f6c'
                                />
                            }
                        />
                    </View>
                    <View style={styles.cellView}>
                        <Input
                            onChangeText = {(link) => this.setState({link})}
                            inputStyle={styles.inputs}
                            placeholder='URL Link (must contain "https://")' //URL 링크 ("https://"로 시작)
                            placeholderTextColor="#bdbdbd"
                            leftIcon={
                                <Icon
                                    name='launch'
                                    size={24}
                                    color='#002f6c'
                                />
                            }
                        />
                    </View>
                    <Text style={{textAlign: 'center'}}> Press to delete. Drag to move. </Text> //삭제를 원하신다면 왼쪽으로 드래그해주세요.
                    <View style={{ flex: 1, width: "84%" }}>
                        <DraggableFlatList
                            keyExtractor={this.keyExtractor}
                            data={this.state.data}
                            renderItem={this.renderItem}
                            onDragEnd={({ data }) => this.setState({ 
                                data: data,
                            })}
                        />
                    </View>
                    <TouchableOpacity style={[styles.buttonContainer, styles.loginButton, {height:45, width: "80%", borderRadius:5,}]} onPress={() => { 
                        ImagePicker.openPicker({
                            multiple: true,
                            mediaType: 'photo', //사진
                            includeExif: true,
                            maxFiles: 20,
                        }).then(images => {
                            var factor = Platform.OS == 'ios' ? 1000 : 1;
                            for (var i = 0; i<images.length; i++) {
                                try {
                                    if (this.state.data.length > 19) {
                                        continue;
                                    }
                                    console.log(images[i]);
                                    if (Platform.OS == 'ios') {
                                        this.setState({
                                            data: this.state.data.concat({ 
                                                date: firestore.Timestamp.fromMillis(parseInt(images[i].modificationDate) * factor),
                                                lat: images[i].exif["{GPS}"].LatitudeRef != "S" ? images[i].exif["{GPS}"].Latitude : -images[i].exif["{GPS}"].Latitude,
                                                long: images[i].exif["{GPS}"].LongitudeRef != "W" ? images[i].exif["{GPS}"].Longitude : -images[i].exif["{GPS}"].Longitude,
                                                photo: images[i].path,
                                                title: i.toString(),
                                                subtitle: i.toString(),
                                            }),
                                        });
                                    } else {
                                        var latitudeStrings = images[i].exif["GPSLatitude"].split(',');
                                        var longitudeStrings = images[i].exif["GPSLongitude"].split(',');

                                        var latitudeD = latitudeStrings[0].split('/');
                                        var latitudeM = latitudeStrings[1].split('/');
                                        var latitudeS = latitudeStrings[2].split('/');

                                        var longitudeD = longitudeStrings[0].split('/');
                                        var longitudeM = longitudeStrings[1].split('/');
                                        var longitudeS = longitudeStrings[2].split('/');

                                        var latitude = parseInt(latitudeD[0]) / parseInt(latitudeD[1]) + (parseInt(latitudeM[0]) / parseInt(latitudeM[1]) / 60) + (parseInt(latitudeS[0]) / parseInt(latitudeS[1]) / 3600);
                                        var longitude = parseInt(longitudeD[0]) / parseInt(longitudeD[1]) + (parseInt(longitudeM[0]) / parseInt(longitudeM[1]) / 60) + (parseInt(longitudeS[0]) / parseInt(longitudeS[1]) / 3600);

                                        if (images[i].exif["GPSLatitudeRef"] == "S") { latitude = -latitude; }
                                        if (images[i].exif["GPSLongitudeRef"] == "W") { longitude = -longitude; }

                                        this.setState({
                                            data: this.state.data.concat({ 
                                                date: firestore.Timestamp.fromMillis(parseInt(images[i].modificationDate) * factor),
                                                lat: latitude,
                                                long: longitude,
                                                photo: images[i].path,
                                                title: i.toString(),
                                                subtitle: i.toString(),
                                            }),
                                        });
                                    }
                                } catch (e) { // location data가 없는 것으로 추정
                                    console.log(e);
                                    this.setState({
                                        data: this.state.data.concat({ 
                                            date: firestore.Timestamp.fromMillis(parseInt(images[i].modificationDate) * factor),
                                            lat: 37,
                                            long: 127,
                                            photo: images[i].path,
                                            title: i.toString(),
                                            subtitle: i.toString(),
                                        }),
                                    });
                                } finally {
                                    if (i == 0) {
                                        this.setState({thumbnail: images[i].path});
                                    }
                                }
                            } 
                        });
                    }}>
                        <Text style={styles.loginText}>Add Photos</Text> //사진 추가
                    </TouchableOpacity>
                    <CheckBox
                        containerStyle={styles.cell}
                        title='Contain location information in photos' //사진의 위치정보 포함
                        iconType='material'
                        checkedIcon='check-box'
                        uncheckedIcon='check-box-outline-blank'
                        checkedColor='#002f6c'
                        checked={this.state.locationChecked}
                        onPress={() => this.setState({locationChecked: !this.state.locationChecked})}
                    />
                    <CheckBox
                        containerStyle={styles.cell}
                        title='Contain date information in photos' //사진의 날짜정보 포함
                        iconType='material'
                        checkedIcon='check-box'
                        uncheckedIcon='check-box-outline-blank'
                        checkedColor='#002f6c'
                        checked={this.state.dateChecked}
                        onPress={() => this.setState({dateChecked: !this.state.dateChecked})}
                    />
                    <TouchableOpacity style={[styles.buttonContainer, styles.loginButton, {height:45, width: "80%", borderRadius:5,}]} onPress={async () => {
                        if (this.state.title.length < 1 || this.state.title.subtitle < 1 || this.state.title.link < 1) {
                            Alert.alert(
                                'Error',
                                'Please fill blank.',
                                [
                                {text: 'OK', onPress: () => console.log('OK Pressed')},
                                ],
                                { cancelable: false }
                            );
                            return;
                        }
                        if (this.state.data.length < 1) {
                            Alert.alert(
                                'Error',
                                'Please add at least one photo.', //하나 이상의 사진을 추가해주세요.
                                [
                                {text: 'OK', onPress: () => console.log('OK Pressed')},
                                ],
                                { cancelable: false }
                            );
                            return;
                        }
                        if (!this.state.locationChecked) {
                            var updateData = this.state.data;
                            for (var i = 0; i < updateData.length; i++) {
                                updateData[i].lat = 37;
                                updateData[i].long = 127;
                            }
                            this.setState({
                                data: updateData,
                            });
                        }
                        if (!this.state.dateChecked) {
                            var updateData = this.state.data;
                            for (var i = 0; i < updateData.length; i++) {
                                updateData[i].date = firestore.Timestamp.fromMillis((new Date()).getTime());
                            }
                            this.setState({
                                data: updateData,
                            });
                        }
                        this.setState({loading: true})
                        await firestore()
                        .collection(auth().currentUser.email)
                        .add({
                            category: this.state.category,
                            date: firestore.Timestamp.fromMillis(this.state.date.getTime()),
                            modifyDate: firestore.Timestamp.fromMillis((new Date()).getTime()),
                            link: this.state.link,
                            title: this.state.title,
                            subtitle: this.state.subtitle,
                            like: {},
                            view: [],
                            viewcode: this.state.viewmode == 'Map' ? 0 : (this.state.viewmode == 'List' ? 1 : 2),
                        })
                        .then(async (documentSnapshot) => {
                            await firestore()
                            .collection("Users")
                            .where("email", "==", auth().currentUser.email)
                            .get()
                            .then(async (querySnapshot) => {
                                querySnapshot.forEach(async (documentSnapshot) => {
                                    await documentSnapshot.ref.update({
                                        modifyDate: firestore.Timestamp.fromMillis((new Date()).getTime()),
                                    });
                                });
                            });
                            var filename = this.state.thumbnail.split('/');

                            var storageRef = storage().ref(`${auth().currentUser.email}/${documentSnapshot._documentPath._parts[1]}/${filename[filename.length - 1]}`);
                            await storageRef.putFile(this.state.thumbnail);

                            this.setState({thumbnail: filename[filename.length - 1]})

                            var updateData = this.state.data;
                            for (var i=0; i < this.state.data.length; i++) {
                                filename = this.state.data[i].photo.split('/');
                                storageChildRef = storage().ref(`${auth().currentUser.email}/${documentSnapshot._documentPath._parts[1]}/${filename[filename.length - 1]}`)
                                await storageChildRef.putFile(this.state.data[i].photo);

                                updateData[i].photo = filename[filename.length - 1];
                            }
                            this.setState({data: updateData});

                            await firestore()
                                .collection(auth().currentUser.email)
                                .doc(documentSnapshot._documentPath._parts[1])
                                .update({
                                    thumbnail: this.state.thumbnail,
                                    data: this.state.data
                                });
                            Alert.alert(
                                'Success', //성공
                                'Successfully uploaded.', //성공적으로 업로드됐습니다.
                                [
                                {text: 'OK', onPress: () => console.log('OK Pressed')},
                                ],
                                { cancelable: false }
                            );
                            if (interstitial.loaded) {
                                interstitial.show();
                            }
                            this.setState({loading: false});
                            this.props.route.params.onPop();
                            this.props.navigation.pop();
                        });
                    }}>
                        <Text style={styles.loginText}>Add List</Text> //목록에 추가
                    </TouchableOpacity>
                </ScrollView>}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: "#fff",
        width: "100%"
    },
    viewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cell: { width: "80%", height: 50 },
    cellView: { 
        width: "84%",
        height: 60, 
    },
    inputs:{
        marginLeft:15,
        borderBottomColor: '#002f6c',
        flex:1,
        color: "#002f6c",
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom:5,
    },
    loginButton: {
        backgroundColor: "#002f6c",
    },
    signUpButton: {
        backgroundColor: "#fff",
        borderColor: '#002f6c',
        borderWidth: 1,
    },
    loginText: {
        color: 'white',
    },
    signUpText: {
        color: '#002f6c',
    }
});