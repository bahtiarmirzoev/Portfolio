# Решение проблем с загрузкой постеров в S3

## Ошибка: "The bucket you are attempting to access must be addressed using the specified endpoint"

Эта ошибка обычно означает одну из следующих проблем:

### 1. Bucket не существует

**Решение:**
- Войдите в [AWS Console](https://console.aws.amazon.com/)
- Перейдите в сервис **S3**
- Проверьте, существует ли bucket с именем `cinema-posters`
- Если bucket не существует, создайте его (см. `AWS_S3_SETUP.md`)

### 2. Неправильный регион

**Проблема:** Bucket находится в другом регионе, чем указано в настройках.

**Решение:**
1. В AWS Console откройте ваш bucket
2. Посмотрите **регион** bucket (например, `us-east-1`, `eu-central-1`, `eu-west-1`)
3. Обновите настройки в `appsettings.Development.json`:

```json
{
  "S3": {
    "BucketName": "cinema-posters",
    "Region": "ПРАВИЛЬНЫЙ_РЕГИОН",  // <-- Исправьте здесь
    "AccessKey": "YOUR_ACCESS_KEY",
    "SecretKey": "YOUR_SECRET_KEY",
    "CdnBaseUrl": "",
    "Folder": "posters"
  }
}
```

**Список регионов:**
- `us-east-1` - Северная Вирджиния
- `us-east-2` - Огайо
- `us-west-1` - Северная Калифорния
- `us-west-2` - Орегон
- `eu-central-1` - Франкфурт
- `eu-west-1` - Ирландия
- `eu-west-2` - Лондон
- `ap-southeast-1` - Сингапур
- И другие...

### 3. Неправильные Access Keys

**Решение:**
1. В AWS Console перейдите в **IAM** → **Users**
2. Найдите вашего пользователя (например, `cinema-s3-user`)
3. Перейдите на вкладку **Security credentials**
4. Убедитесь, что Access Keys активны
5. Если нужно, создайте новые Access Keys
6. Обновите настройки в `appsettings.Development.json`

### 4. Недостаточные права доступа

**Решение:**
1. В IAM найдите вашего пользователя
2. Проверьте прикрепленные политики
3. Убедитесь, что есть политика с правами:
   - `s3:PutObject`
   - `s3:GetObject`
   - `s3:DeleteObject`
   - `s3:ListBucket`

**Минимальная политика:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::cinema-posters/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::cinema-posters"
        }
    ]
}
```

### 5. Bucket создан до 2018 года (старый формат)

Если bucket был создан до 2018 года, он может использовать другой формат URL.

**Решение:**
- Создайте новый bucket (рекомендуется)
- Или используйте правильный формат URL в коде

## Быстрая проверка настроек

1. **Проверьте bucket:**
   ```bash
   # В AWS Console: S3 → Buckets → cinema-posters
   # Убедитесь, что bucket существует и виден
   ```

2. **Проверьте регион:**
   ```bash
   # В AWS Console: S3 → Buckets → cinema-posters
   # Посмотрите регион в свойствах bucket
   ```

3. **Проверьте Access Keys:**
   ```bash
   # В AWS Console: IAM → Users → ваш пользователь → Security credentials
   # Убедитесь, что Access Keys активны
   ```

4. **Проверьте права:**
   ```bash
   # В AWS Console: IAM → Users → ваш пользователь → Permissions
   # Убедитесь, что есть политика с правами на S3
   ```

## Тестирование подключения

После исправления настроек:

1. Перезапустите backend:
   ```bash
   cd Movies.Api
   dotnet run
   ```

2. Попробуйте загрузить постер через админ-панель

3. Проверьте логи backend - там будут детальные сообщения об ошибках

## Логи для отладки

В логах backend вы увидите:
- `Uploading file to S3. Bucket: ...` - начало загрузки
- `File uploaded successfully. URL: ...` - успешная загрузка
- `S3 error: ...` - ошибка S3 с деталями

## Частые ошибки и решения

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `NoSuchBucket` | Bucket не существует | Создайте bucket в AWS Console |
| `AccessDenied` | Недостаточно прав | Добавьте политику с правами S3 |
| `InvalidAccessKeyId` | Неверный Access Key | Проверьте Access Key в настройках |
| `SignatureDoesNotMatch` | Неверный Secret Key | Проверьте Secret Key в настройках |
| `The bucket you are attempting to access...` | Неправильный регион | Проверьте регион bucket и настройки |
| `AccessControlListNotSupported` | Bucket не поддерживает ACL | Код уже исправлен. Настройте Bucket Policy для публичного доступа (см. ниже) |

### Ошибка: "AccessControlListNotSupported" или "The bucket does not allow ACLs"

**Причина:** Bucket был создан с отключенными ACL (Object Ownership = "Bucket owner enforced").

**Решение:**
1. Код уже исправлен - `CannedACL` удален из кода
2. Настройте Bucket Policy для публичного доступа:

**В AWS Console:**
1. Откройте ваш bucket (`cinema-posters`)
2. Перейдите на вкладку **Permissions** (Разрешения)
3. Прокрутите до секции **Bucket policy**
4. Нажмите **Edit** и вставьте следующую политику:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::cinema-posters/*"
        }
    ]
}
```

**⚠️ ВАЖНО:** Замените `cinema-posters` на имя вашего bucket!

5. Сохраните изменения

Теперь файлы будут публично доступны через URL, даже без ACL.

## Дополнительная помощь

Если проблема не решена:
1. Проверьте логи backend для детальной информации
2. Убедитесь, что bucket публично доступен (если нужно)
3. Проверьте CORS настройки bucket (см. `AWS_S3_SETUP.md`)
4. Убедитесь, что IAM пользователь имеет правильные права

