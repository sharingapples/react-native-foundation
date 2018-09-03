# Foundation
A simple react-native cli facade to make some of the trivial
native tasks simpler and easier. And make your react-native
project work with [yarn workspaces](https://yarnpkg.com/en/docs/workspaces).

## Installation
> `$ npm install -g react-native-foundation`

or

> `$ yarn global add react-native-foundation`

## Usage
### New Project
The foundation cli could be easily used to create a new
react-native project.

> `$ foundation create <ProjectName>`<br/>

This command works similar to `react-native init` except that
the project will not include the native sources, but a
`foundation.config.js` file, which could be used to configure
the most trivial native [configurations](#configurations).

> `$ foundation run-android`<br/>
> `$ foundation run-ios`<br/>

This command will build the native code and publish the app
on the connected device (simulator) for development purpose.
These command delegate their task to their respective
react-native commands, but before doing that, they make changes to the native code, to reflect back the configuration.

> `$ foundation start`<br/>

This command will start the packager, making sure that you
are able to run them with or without the native codes. It just
needs an `index.js` to serve. Will work even without a valid
node `package.json`.

> `$ foundation create-native`<br/>

You will almost always need to change the native code specially
when it comes to shipping. This command will create native
source `android` and `ios` on your **workspace** (yarn).
Note that if you have multiple react-native project on your
yarn workspace there can only be one native source for all your react native project. This is most likely the usecase when you are working through a workspace. There isn't a
workaround for this, and you will have to opt to multiple
yarn workspaces if you need separate native codes.

Also checkout the `nativeRepo` configuration that allows you
to maintain your own native repo, just make sure that you
inherit your native repo from that provided by the foundation.

### Native source changes
The native source for `android` and `ios` makes a few subtle
changes to incorporate the configurations automatically.
1. **Android** `app/build.gradle` - Read app specific confgiration from a json file dynamically.
2. **Android** `app/src/main/res/strings.xml` - The display name is also provided and hence `app_name` has been removed.
3. **Android** `app/src/main/res/drawable/splash_background.xml`  `SplashTheme` has been added as a background for launch screen.
4. **Android** `app/src/main/res/values/styles.xml`. **SplashTheme** using the Splash Background has been defined.
5. **Android** `app/src/main/AndroidManifest.xml` `SplashActivity` has been added with an Intent to Launch. `MainActivity` uses `SplashTheme` as background. Just make sure your app renders with a background color to avoid showing the Splash Theme.
6. **Android** `..../SplashActivity.java` Activity file for showing the Launch screen.
7. **iOS** Uses CocoaPods to manage dependencies.
8. **iOS** `Foundation/AppDelegate.m` is modified to display
launch screen for an extended period, to avoid showing white screen when the javascript side loads. (Extracted from react-native pro-tip)
9. **iOS** Uses PlistBuddy to change `Foundation/Info.plist` dynamically to update `name`, `version`, `bundleId` and `build` when building ios app.

### Existing Project
Since the native source is a bit different than what stock
react-native provides, follow the following steps. (Basically
remove your current code, get the code from foundation and then look for changes).
1. Make sure your code is committed to your source control.
2. Remove `ios` and `android` folder.
3. Run `foundation create-native` on your workspace.<br/>
   This will create a fresh android and ios folder.
4. You could use `foundation link` or `react-native link`
   to link to your native dependencies once you have the
   native sources. Note that your native sources now use
   pods for ios.
5. Compare and update changes with your existing native code.

If your native code has changed quite a lot then its
easier to include the [changes](#native-source-changes) as mentioned above, in your native code to support `foundation`.


### Configurations
1. `appName`: The name of the app as displayed on your mobile
2. `bundleId`: A unique id that identifies your app on
  play store or app store.
3. `version`: A short text version name displayed on app
  store or play store.
4. `build`: A version number or build number used by
  play store and app store to track the version of your app.
5. `launcher`: A folder location that provides app launcher
  icons of all sizes. The folder should contain files for all
  phone resolutions which should be named as:
    * For android:
        * `ic_launcher-mdpi.png`
        * `ic_launcher-hdpi.png`
        * `ic_launcher-xhpi.ong`
        * `ic_launcher-xxhpi.ong`
        * `ic_launcher-xxxhpi.ong`
    * For ios:
        * `ios-20@1x.png`
        * `ios-20@2x.png`
        * `ios-20@3x.png`
        * `ios-29@1x.png`
        * `ios-29@2x.png`
        * `ios-29@3x.png`
        * `ios-40@1x.png`
        * `ios-40@2x.png`
        * `ios-40@3x.png`
        * `ios-60@2x.png`
        * `ios-76@1x.png`
        * `ios-76@2x.png`
        * `ios-83.5@2x.png`
        * `ios-1024@1x.png`
6. `splash`: A folder location that provides splash icons for
   all screen sizes.
    * For android:
        * `ic_splash-mdpi.png`
        * `ic_splash-hdpi.png`
        * `ic_splash-xhpi.png`
        * `ic_splash-xxhdpi.png`
        * `ic_splash-xxxhdpi.png`
    * For ios:
        * `ios-splash@1x.png`
        * `ios-splash@2x.png`
        * `ios-splash@3x.png`
7. `nativeRepo`: You can build your custom native repo and use
it instead of the stock foundation repo. Just make sure your
native repo supports foundation.

You could also use the [Sketch App Template](https://github.com/sharingapples/react-native-foundation/blob/master/Icon-Template.sketch) for the `launcher` and `splash` icons.

## Notes
The react-native apps use `Foundation` as a default module name. So yes, in development mode you could use the same
native app to load different apps being served by the metro
bundler, and as long as there is no difference in react-native
version or native modules, your app should load just fine.

It's actually one of the way to improve app development. Build
one app with all your native dependencies. Deploy it on all
your test devices. And run `foundation start` anywhere.

## TODO
1. **Release**: Simple command to create `apk` and `ipa` files ready for submission.
