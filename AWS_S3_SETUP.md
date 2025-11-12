# Инструкция по настройке AWS S3 для хранения постеров

## Шаг 1: Создание S3 Bucket в AWS

1. Войдите в [AWS Console](https://console.aws.amazon.com/)
2. Перейдите в сервис **S3** (Simple Storage Service)
3. Нажмите **"Create bucket"** (Создать bucket)
4. Заполните форму:
   - **Bucket name**: `cinema-posters` (или любое уникальное имя)
   - **AWS Region**: Выберите регион (например, `eu-central-1` для Франкфурта)
   - **Object Ownership**: `ACLs enabled` (для публичного доступа)
   - **Block Public Access settings**: 
     - ✅ Снимите галочку "Block all public access" (если нужен публичный доступ)
     - Или оставьте включенным и используйте CloudFront CDN
   - **Bucket Versioning**: Отключено (по умолчанию)
   - **Default encryption**: По желанию
5. Нажмите **"Create bucket"**

## Шаг 2: Настройка CORS для Bucket

1. Откройте созданный bucket
2. Перейдите на вкладку **"Permissions"** (Разрешения)
3. Прокрутите до секции **"Cross-origin resource sharing (CORS)"**
4. Нажмите **"Edit"** и вставьте следующую конфигурацию:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://yourdomain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

5. Сохраните изменения

## Шаг 3: Настройка публичного доступа (если нужен прямой доступ)

1. В том же bucket, вкладка **"Permissions"**
2. Секция **"Block public access"** → **"Edit"**
3. Снимите все галочки (если хотите публичный доступ)
4. Подтвердите изменения
5. В секции **"Bucket policy"** → **"Edit"** → вставьте:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

**⚠️ ВАЖНО**: Замените `YOUR-BUCKET-NAME` на имя вашего bucket!

## Шаг 4: Создание IAM пользователя для доступа

1. Перейдите в **IAM** (Identity and Access Management)
2. В меню слева выберите **"Users"** (Пользователи)
3. Нажмите **"Create user"** (Создать пользователя)
4. **User name**: `cinema-s3-user` (или любое имя)
5. Нажмите **"Next"**
6. Выберите **"Attach policies directly"**
7. Найдите и выберите политику: **`AmazonS3FullAccess`** (или создайте кастомную с минимальными правами)
8. Нажмите **"Next"** → **"Create user"**

## Шаг 5: Создание Access Keys

1. Откройте созданного пользователя
2. Перейдите на вкладку **"Security credentials"** (Учетные данные безопасности)
3. Прокрутите до секции **"Access keys"**
4. Нажмите **"Create access key"**
5. Выберите **"Application running outside AWS"**
6. Нажмите **"Next"** → **"Create access key"**
7. **⚠️ ВАЖНО**: Скопируйте и сохраните:
   - **Access key ID**
   - **Secret access key** (показывается только один раз!)

## Шаг 6: Настройка конфигурации в проекте

### Вариант 1: Через appsettings.json (только для разработки!)

Откройте файл: `Movies.Api/appsettings.Development.json`

```json
{
  "S3": {
    "BucketName": "cinema-posters",
    "Region": "eu-central-1",
    "AccessKey": "YOUR_ACCESS_KEY_ID",
    "SecretKey": "YOUR_SECRET_ACCESS_KEY",
    "CdnBaseUrl": "",
    "Folder": "posters"
  }
}
```

**⚠️ НЕ КОММИТЬТЕ ЭТОТ ФАЙЛ С РЕАЛЬНЫМИ КЛЮЧАМИ В GIT!**

### Вариант 2: Через User Secrets (рекомендуется для разработки)

Выполните в терминале из папки `Movies.Api`:

```bash
dotnet user-secrets init
dotnet user-secrets set "S3:BucketName" "cinema-posters"
dotnet user-secrets set "S3:Region" "eu-central-1"
dotnet user-secrets set "S3:AccessKey" "YOUR_ACCESS_KEY_ID"
dotnet user-secrets set "S3:SecretKey" "YOUR_SECRET_ACCESS_KEY"
dotnet user-secrets set "S3:Folder" "posters"
```

### Вариант 3: Через Environment Variables (для production)

Установите переменные окружения:

```bash
export S3__BucketName="cinema-posters"
export S3__Region="eu-central-1"
export S3__AccessKey="YOUR_ACCESS_KEY_ID"
export S3__SecretKey="YOUR_SECRET_ACCESS_KEY"
export S3__Folder="posters"
```

Или в Docker/docker-compose.yml:

```yaml
environment:
  - S3__BucketName=cinema-posters
  - S3__Region=eu-central-1
  - S3__AccessKey=YOUR_ACCESS_KEY_ID
  - S3__SecretKey=YOUR_SECRET_ACCESS_KEY
  - S3__Folder=posters
```

## Шаг 7: Установка NuGet пакета (если еще не установлен)

Выполните в терминале из папки `Movies.Api`:

```bash
dotnet restore
```

Пакет `AWSSDK.S3` уже добавлен в `.csproj`, но убедитесь, что он установлен.

## Шаг 8: Тестирование

1. Запустите backend: `dotnet run` в папке `Movies.Api`
2. Запустите frontend: `npm run dev` в папке `frontend`
3. Войдите как администратор
4. Перейдите в админ-панель
5. Попробуйте создать фильм/сериал и загрузить постер
6. Проверьте, что файл появился в S3 bucket

## Структура файлов в S3

После загрузки файлы будут храниться по пути:
```
bucket-name/
  └── posters/
      └── {guid}.jpg
      └── {guid}.png
      └── ...
```

## Опционально: Настройка CloudFront CDN

Если хотите использовать CDN для ускорения загрузки:

1. Создайте CloudFront Distribution
2. Origin: выберите ваш S3 bucket
3. Скопируйте **Distribution Domain Name**
4. Вставьте в `S3:CdnBaseUrl` в конфигурации:
   ```json
   "CdnBaseUrl": "https://d1234567890.cloudfront.net"
   ```

## Безопасность

- ✅ Никогда не коммитьте Access Keys в Git
- ✅ Используйте User Secrets для разработки
- ✅ Используйте Environment Variables для production
- ✅ Ограничьте права IAM пользователя только необходимыми операциями
- ✅ Рассмотрите использование CloudFront для публичного доступа вместо прямого доступа к S3

## Минимальная IAM Policy (вместо AmazonS3FullAccess)

Если хотите ограничить права, создайте кастомную политику:

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
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
        }
    ]
}
```

Замените `YOUR-BUCKET-NAME` на имя вашего bucket.

