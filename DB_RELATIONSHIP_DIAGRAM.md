# Діаграма зв’язків документів у базі даних MongoDB

Ось код для PlantUML (ER-діаграма для NoSQL бази даних):

```plantuml
@startuml
title Рис. 2.3.2 – Діаграма зв’язків документів у базі даних MongoDB (StoryFlow)

' Налаштування стилю
skinparam linetype ortho
skinparam shadowing false
skinparam class {
    BackgroundColor White
    ArrowColor #2688d4
    BorderColor #2688d4
}

entity "User" as user {
    * _id : ObjectId
    --
    username : String
    email : String
    password : String
    role : enum
    stats : Object
}

entity "Manga" as manga {
    * _id : ObjectId
    --
    title : String
    author : ObjectId <<FK>>
    description : String
    type : String
    status : String
    genres : Array
    ratingStats : Object
}

entity "Chapter" as chapter {
    * _id : ObjectId
    --
    mangaId : ObjectId <<FK>>
    chapterNumber : Number
    title : String
    pages : Array
}

entity "Literature" as lit {
    * _id : ObjectId
    --
    title : String
    author : ObjectId <<FK>>
    manga : ObjectId <<FK>> (optional)
    genres : Array
    status : String
}

entity "LiteratureChapter" as litchap {
    * _id : ObjectId
    --
    literatureId : ObjectId <<FK>>
    title : String
    content : String
}

entity "Comment" as comment {
    * _id : ObjectId
    --
    user : ObjectId <<FK>>
    mangaId : ObjectId <<FK>>
    literatureId : ObjectId <<FK>>
    text : String
}

entity "UserList" as ulist {
    * _id : ObjectId
    --
    user : ObjectId <<FK>>
    manga : ObjectId <<FK>>
    status : enum
}

entity "Rating" as rating {
    * _id : ObjectId
    --
    user : ObjectId <<FK>>
    manga : ObjectId <<FK>>
    value : Number
}

entity "History" as history {
    * _id : ObjectId
    --
    user : ObjectId <<FK>>
    manga : ObjectId <<FK>>
    chapter : ObjectId <<FK>>
}

' Зв'язки
user ||--o{ manga : "створює (автор)"
user ||--o{ lit : "пише (автор)"
user ||--o{ comment : "залишає"
user ||--o{ rating : "оцінює"
user ||--o{ ulist : "має список"
user ||--o{ history : "має історію"

manga ||--|{ chapter : "містить"
manga ||--o{ ulist : "додається в"
manga ||--o{ rating : "отримує"
manga ||--o{ lit : "має фанфіки"

lit ||--|{ litchap : "містить"
lit ||--o{ comment : "обговорюється"
manga ||--o{ comment : "обговорюється"

history }o--|| chapter : "вказує на"

@enduml
```

### Опис зв'язків:
1.  **User -> Manga/Literature**: Зв'язок "один-до-багатьох" (один користувач може бути автором багатьох творів).
2.  **Manga -> Chapter**: Зв'язок "один-до-багатьох" (один тайтл містить багато розділів).
3.  **Manga -> Literature**: Опціональний зв'язок, якщо фанфік або книга базується на конкретній манзі.
4.  **UserList / Rating**: Таблиці зв'язків (Many-to-Many), що з'єднують користувачів та контент.
5.  **History**: Фіксує прогрес читання конкретного користувача в конкретному розділі.
