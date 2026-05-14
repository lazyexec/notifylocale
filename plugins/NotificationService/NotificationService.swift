import UserNotifications

class NotificationService: UNNotificationServiceExtension {

    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?

    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

        guard let bestAttemptContent = bestAttemptContent else {
            contentHandler(request.content)
            return
        }

        let userInfo = request.content.userInfo
        let titleKey = userInfo["titleKey"] as? String ?? ""
        let bodyKey  = userInfo["bodyKey"]  as? String ?? ""

        let titleTemplate = NSLocalizedString(titleKey, bundle: Bundle.main, comment: "")
        let bodyTemplate  = NSLocalizedString(bodyKey,  bundle: Bundle.main, comment: "")

        bestAttemptContent.title = interpolate(titleTemplate, userInfo: userInfo)
        bestAttemptContent.body  = interpolate(bodyTemplate,  userInfo: userInfo)

        contentHandler(bestAttemptContent)
    }

    override func serviceExtensionTimeWillExpire() {
        if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }

    private func interpolate(_ template: String, userInfo: [AnyHashable: Any]) -> String {
        guard let varsString = userInfo["vars"] as? String,
              let data = varsString.data(using: .utf8),
              let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return template
        }
        var result = template
        for (key, value) in dict {
            result = result.replacingOccurrences(of: "{{\(key)}}", with: "\(value)")
        }
        return result
    }
}
