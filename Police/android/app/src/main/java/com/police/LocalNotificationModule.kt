package com.police

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LocalNotificationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "LocalNotificationModule"

  @ReactMethod
  fun showNotification(title: String, message: String) {
    val context = reactApplicationContext
    val channelId = "high_priority_notifications"

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val name = "High Priority Notifications"
      val descriptionText = "Notifications for account approvals and department alerts"
      val importance = NotificationManager.IMPORTANCE_HIGH
      val channel = NotificationChannel(channelId, name, importance).apply {
        description = descriptionText
        enableVibration(true)
      }
      val notificationManager: NotificationManager =
          context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      notificationManager.createNotificationChannel(channel)
    }

    val builder = NotificationCompat.Builder(context, channelId)
        .setSmallIcon(R.mipmap.ic_launcher)
        .setContentTitle(title)
        .setContentText(message)
        .setStyle(NotificationCompat.BigTextStyle().bigText(message))
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setDefaults(NotificationCompat.DEFAULT_ALL)
        .setAutoCancel(true)

    try {
      val notificationManager = NotificationManagerCompat.from(context)
      notificationManager.notify(System.currentTimeMillis().toInt(), builder.build())
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }
}
