# UML-діаграма класів програмного забезпечення StoryFlow

Ось код для PlantUML (Діаграма класів):

```plantuml
@startuml
title Рис. 3.1.1 – UML-діаграма класів програмного забезпечення системи «StoryFlow»

skinparam classAttributeIconSize 0
skinparam linetype ortho

class User {
    + String username
    + String email
    - String password
    + String role
    + Object stats
    + matchPassword(enteredPassword): Boolean
}

class Manga {
    + String title
    + String alternativeTitle
    + String description
    + String type
    + String status
    + Array genres
    + Object ratingStats
    + String moderationStatus
}

class Chapter {
    + Number chapterNumber
    + String title
    + Array pages
    + Date createdAt
}

class Literature {
    + String title
    + String description
    + Array genres
    + Boolean isOfficial
    + String status
    + String direction
    + String ageRating
}

class LiteratureChapter {
    + String title
    + String content
    + Number chapterNumber
}

class Comment {
    + String text
    + Date createdAt
}

class Rating {
    + Number value
    + Date createdAt
}

class UserList {
    + String status
    + Date addedAt
}

class History {
    + Date lastReadAt
}

' Зв'язки (асоціації)
User "1" -- "0..*" Manga : "створює"
User "1" -- "0..*" Literature : "пише"
User "1" -- "0..*" Comment : "пише"
User "1" -- "0..*" Rating : "ставить"
User "1" -- "0..*" UserList : "має"
User "1" -- "0..*" History : "має"

Manga "1" *-- "1..*" Chapter : "містить"
Literature "1" *-- "1..*" LiteratureChapter : "містить"

Manga "1" -- "0..*" Comment : "отримує"
Manga "1" -- "0..*" Rating : "має"
Manga "1" -- "0..*" UserList : "додана до"

Literature "1" -- "0..*" Comment : "отримує"
Manga "0..1" -- "0..*" Literature : "базується на"

History "0..*" -- "1" Chapter : "посилається на"

@enduml
```

### Пояснення діаграми:
1.  **Класи**: Кожен клас відповідає моделі в базі даних (User, Manga, Chapter тощо).
2.  **Атрибути**: Вказано типи даних (String, Number, Array, Date). Приватні поля (як-от пароль) позначені знаком `-`, публічні — `+`.
3.  **Методи**: Наприклад, у класу `User` є метод `matchPassword` для перевірки авторизації.
4.  **Зв'язки**:
    - **Композиція (`*--`)**: Тісний зв'язок між Manga та Chapter (розділ не може існувати без манги).
    - **Асоціація (`--`)**: Зв'язки між користувачем та його контентом або оцінками.
    - **Кратність (`1`, `0..*`)**: Показує, скільки об'єктів одного класу може бути пов'язано з іншим (наприклад, один користувач має багато коментарів).
