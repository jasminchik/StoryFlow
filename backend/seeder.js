const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Manga = require('./models/Manga');
const Chapter = require('./models/Chapter');
const Literature = require('./models/Literature');
const LiteratureChapter = require('./models/LiteratureChapter');

// Load env vars
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/storyflow';

const importData = async () => {
  try {
    console.log('Connecting to database:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // Clean DB
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Manga.deleteMany({});
    await Chapter.deleteMany({});
    await Literature.deleteMany({});
    await LiteratureChapter.deleteMany({});
    console.log('Database cleared.');

    // 1. Seed Users
    console.log('Creating users...');
    
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@storyflow.com',
      password: 'password123',
      role: 'admin'
    });

    const author1 = await User.create({
      username: 'kolesnyk_author',
      email: 'kolesnyk@storyflow.com',
      password: 'password123',
      role: 'author'
    });

    const author2 = await User.create({
      username: 'lesya_ukrainka',
      email: 'lesya@storyflow.com',
      password: 'password123',
      role: 'author'
    });

    const readerUser = await User.create({
      username: 'reader1',
      email: 'reader1@storyflow.com',
      password: 'password123',
      role: 'user'
    });

    console.log(`Users created: admin (${adminUser._id}), author1 (${author1._id}), author2 (${author2._id}), reader (${readerUser._id})`);

    // 2. Seed Manga
    console.log('Creating manga titles with local cover art...');
    const manga1 = await Manga.create({
      title: 'Атака Титанів',
      alternativeTitle: 'Shingeki no Kyojin',
      description: 'Багато років тому людство було майже винищене гігантськими людиноподібними істотами, яких називають Титанами. Вони дурні, але пожирають людей заради задоволення. Вцілілі збудували три стіни заввишки 50 метрів і жили спокійно 100 років, поки не з’явився Колосальний Титан...',
      coverImage: '/uploads/attack_on_titan.jpg',
      type: 'Манґа',
      status: 'Завершено',
      genres: ['Екшн', 'Військове', 'Драма', 'Фентезі'],
      author: author1._id,
      moderationStatus: 'approved'
    });

    const manga2 = await Manga.create({
      title: 'Підняття рівня поодинці (Соло Левелінг)',
      alternativeTitle: 'Solo Leveling',
      description: 'У світі, де відкрилися таємничі портали в підземелля, частина людей отримала надприродні сили. Їх називають Мисливцями. Сон Джін У — мисливець найнижчого E-рангу, якого називають «найслабшою зброєю людства». Але після смертельної пастки в підземеллі він отримує унікальну систему, яка дозволяє йому безкінечно прокачувати свій рівень...',
      coverImage: '/uploads/solo_leveling.jpg',
      type: 'Манхва',
      status: 'В процесі',
      genres: ['Бойовик', 'Пригоди', 'Фентезі'],
      author: author1._id,
      moderationStatus: 'approved'
    });

    const manga3 = await Manga.create({
      title: 'Мій сусід Тоторо',
      alternativeTitle: 'Tonari no Totoro',
      description: 'Японська глибинка 1950-х років. Дві сестри, Сацукі та Мей, переїжджають до старого сільського будинку разом із батьком, щоб бути ближче до мами, яка лежить у лікарні. Дівчатка швидко виявляють, що ліс навколо заселений чарівними істотами — духами лісу на чолі з величним Тоторо.',
      coverImage: '/uploads/totoro.jpg',
      type: 'Комікс',
      status: 'Завершено',
      genres: ['Казка', 'Повсякденність', 'Сімейний'],
      author: author2._id,
      moderationStatus: 'approved'
    });

    const manga4 = await Manga.create({
      title: 'Таємничий Веб-Новеліст',
      alternativeTitle: 'The Web Novelist',
      description: 'Історія про автора-початківця, який випадково відкриває портал у світ своїх власних творів. Твір очікує схвалення модератором.',
      coverImage: '/uploads/novel.jpg',
      type: 'Манґа',
      status: 'Анонс',
      genres: ['Романтика', 'Драма'],
      author: author2._id,
      moderationStatus: 'pending'
    });

    console.log('Manga titles created.');

    // 3. Seed Manga Chapters
    console.log('Creating manga chapters...');
    await Chapter.create({
      manga: manga2._id,
      volume: 1,
      chapterNumber: 1,
      title: 'Найслабший з усіх',
      pages: [
        'https://images.unsplash.com/photo-1601662539747-405cb0647a11?w=600',
        'https://images.unsplash.com/photo-1601662539615-5626cc99e7c1?w=600',
        'https://images.unsplash.com/photo-1601662539958-86d7cd8fcf9a?w=600'
      ]
    });

    await Chapter.create({
      manga: manga2._id,
      volume: 1,
      chapterNumber: 2,
      title: 'Подвійне підземелля',
      pages: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
        'https://images.unsplash.com/photo-1518709768805-001097304620?w=600'
      ]
    });

    await Chapter.create({
      manga: manga1._id,
      volume: 1,
      chapterNumber: 1,
      title: 'До тебе, через 2000 років',
      pages: [
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=600',
        'https://images.unsplash.com/photo-1561715276-a2d087060f1d?w=600'
      ]
    });

    console.log('Manga chapters created.');

    // 4. Seed Literature
    console.log('Creating literature titles with local covers...');
    const lit1 = await Literature.create({
      title: 'Лісова пісня: Нова інтерпретація',
      description: 'Альтернативна історія кохання Мавки та Лукаша в сучасному стилі фентезі. Що було б, якби Мавка прийшла у сучасний мегаполіс?',
      coverImage: '/uploads/mavka.png',
      genres: ['Фентезі', 'Драма', 'Романтика'],
      author: author2._id,
      moderationStatus: 'approved'
    });

    const lit2 = await Literature.create({
      title: 'Тіні забутих предків (Ремейк)',
      description: 'Нове бачення класичної повісті про кохання Івана та Марічки з додаванням містичних карпатських легенд та небезпечних пригод.',
      coverImage: '/uploads/carpathians.jpg',
      genres: ['Класика', 'Містика', 'Романтика'],
      author: author1._id,
      moderationStatus: 'approved'
    });

    const lit3 = await Literature.create({
      title: 'Пригоди у Віртуальному Світі',
      description: 'Фанфік про геймерів, які застрягли у віртуальній реальності популярної MMORPG гри та змушені боротися за виживання.',
      coverImage: '/uploads/novel.jpg',
      genres: ['Пригоди', 'ЛитРПГ', 'Фантастика'],
      author: author1._id,
      moderationStatus: 'pending'
    });

    console.log('Literature titles created.');

    // 5. Seed Literature Chapters
    console.log('Creating literature chapters...');
    await LiteratureChapter.create({
      literature: lit1._id,
      chapterNumber: 1,
      title: 'Пробудження весни',
      content: '<p>Весна цього року прийшла несподівано рано. Проліски пробивали собі шлях крізь талий сніг, а дерева починали тихо перешіптуватися про перше тепло.</p><p>Лукаш йшов лісовою стежкою, притискаючи до грудей свою нову сопілку. Він відчував, як ліс спостерігає за ним тисячами невидимих очей...</p>'
    });

    await LiteratureChapter.create({
      literature: lit1._id,
      chapterNumber: 2,
      title: 'Перша зустріч',
      content: '<p>Голос сопілки розливався гаєм, мов чистий джерельний струмок. Зелені гілки старого дуба заколихалися, і перед Лукашем постала дівчина з очима кольору весняного листя.</p><p>— Хто ти? — прошепотів юнак, завмерши на місці.</p><p>— Я та, що живе у цих лісах, — тихо відповіла вона, посміхаючись.</p>'
    });

    await LiteratureChapter.create({
      literature: lit2._id,
      chapterNumber: 1,
      title: 'Гуцульські перекази',
      content: '<p>Карпати ховають у своїх ущелинах безліч таємниць. Старий Іван любив сидіти біля ватри і слухати вітер, який розповідав історії про чугайстрів та нявок.</p><p>Його серце завжди належало Марічці, хоча їхні родини ворогували поколіннями...</p>'
    });

    console.log('Literature chapters created.');
    console.log('Database successfully seeded! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error during data import:', error);
    process.exit(1);
  }
};

importData();
