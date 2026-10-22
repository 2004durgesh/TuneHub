# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# Room (via WorkManager, used by nitro-player and nitro-ota) creates its generated database by
# reflection; Room's own rule keeps the class but not its constructor under R8 full mode, so the
# app crashed at launch (NoSuchMethodException: WorkDatabase_Impl.<init>).
-keep class * extends androidx.room.RoomDatabase { <init>(); }
# Nitro creates its Kotlin hybrid objects from C++ over JNI, which R8 can't see; without this the
# optimizing preset nulls their fields (NPE in NitroOta.getStoredOtaVersion at launch).
-keep class com.margelo.nitro.** { *; }
