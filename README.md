# Автоматизация судебных отчетов об оценке

Скрипт читает данные из PDF и Excel, затем заполняет Word-шаблон для формирования итогового отчета.

## Структура проекта

```text
valuation-auto/
├── config.py
├── processor.py
├── requirements.txt
├── README.md
├── log.txt                 # создается автоматически после запуска
├── input_pdf/              # входящие PDF-файлы
├── templates/              # шаблоны: .docx и расчет ущерба (.xlsx/.xlsm/.xls)
└── output/                 # готовые Word-отчеты
```

## Метки для Word-шаблона

Добавьте в `.docx`-шаблон следующие плейсхолдеры:

- `{{case_no}}` — номер дела
- `{{car_model}}` — марка/модель авто
- `{{plate_no}}` — государственный номер
- `{{judge}}` — ФИО судьи
- `{{total_amount}}` — итоговая сумма ущерба (из Excel)
- `{{incident_date}}` — дата ДТП
- `{{court}}` — полное название суда

## Как запустить

1. Установите зависимости:

```bash
pip install -r requirements.txt
```

2. Положите:
   - PDF-файлы в `input_pdf/`
   - Excel с расчетом ущерба в `templates/`
   - Word-шаблон `.docx` в `templates/`

3. Запустите:

```bash
python processor.py
```

Итоговые файлы появятся в `output/`, а подробный лог извлечения полей — в `log.txt`.
