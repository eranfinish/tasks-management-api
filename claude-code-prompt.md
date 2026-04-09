# 🎯 Claude Code Prompt - Tasks API Implementation

## הקשר הפרויקט

אני עובד על **Tasks API** ב-NestJS עבור bootcamp.
יש לי פרויקט חלקי שצריך להשלים.

**Tech Stack:**
- NestJS 10+
- TypeScript
- PostgreSQL (בשלב ראשון - in-memory)
- class-validator + class-transformer
- Swagger

---

## מה יש לי עכשיו (חלקי)

אני כבר יש לי:
- NestJS project מותקן
- Tasks Module בסיסי
- יכול להיות Controller/Service חלקי או ריק

---

## מה אני צריך שתממש

### 1️⃣ **מבנה קבצים מלא**

```
src/
├── tasks/
│   ├── dto/
│   │   ├── create-task.dto.ts          [צריך ליצור/לעדכן]
│   │   ├── update-task.dto.ts          [צריך ליצור/לעדכן]
│   │   └── filter-tasks.dto.ts         [צריך ליצור]
│   ├── enums/
│   │   ├── task-status.enum.ts         [צריך ליצור]
│   │   └── task-priority.enum.ts       [צריך ליצור]
│   ├── interfaces/
│   │   └── task.interface.ts           [צריך ליצור]
│   ├── tasks.controller.ts             [צריך לעדכן]
│   ├── tasks.service.ts                [צריך לעדכן]
│   └── tasks.module.ts                 [קיים]
├── common/
│   ├── guards/
│   │   └── api-key.guard.ts            [צריך ליצור]
│   └── interceptors/
│       ├── logging.interceptor.ts      [צריך ליצור]
│       └── transform.interceptor.ts    [צריך ליצור]
└── main.ts                             [צריך לעדכן]
```

---

### 2️⃣ **Enums - צור אותם ראשונים**

**task-status.enum.ts:**
```typescript
export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
```

**task-priority.enum.ts:**
```typescript
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
```

---

### 3️⃣ **Interface**

**task.interface.ts:**
```typescript
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4️⃣ **DTOs עם Validation**

**create-task.dto.ts** - עם כל ה-decorators:
- @IsString()
- @IsNotEmpty()
- @MinLength(3)
- @MaxLength(100)
- @MinLength(10) לdescription
- @IsEnum() לstatus ו-priority
- הודעות בעברית!

**update-task.dto.ts:**
- PartialType של CreateTaskDto

**filter-tasks.dto.ts:**
- @IsOptional()
- @IsEnum()
- status?: TaskStatus
- priority?: TaskPriority

---

### 5️⃣ **Service מלא**

**tasks.service.ts צריך לכלול:**

```typescript
@Injectable()
export class TasksService {
  // In-memory storage
  private tasks: Task[] = [];
  private idCounter = 1;

  // Methods צריכים:
  findAll(filterDto?: FilterTasksDto): Task[]      // עם filtering!
  findOne(id: number): Task                         // עם NotFoundException
  create(createTaskDto: CreateTaskDto): Task
  update(id: number, updateTaskDto: UpdateTaskDto): Task
  remove(id: number): void
}
```

**Filtering logic בפירוט:**
- אם יש filterDto.status → סנן לפי status
- אם יש filterDto.priority → סנן לפי priority
- צריך לעבוד ביחד (status AND priority)

---

### 6️⃣ **Controller מלא**

**tasks.controller.ts צריך:**

```typescript
@Controller('tasks')
@UseGuards(ApiKeyGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class TasksController {
  // Endpoints:
  @Get()                    // עם @Query() filterDto
  @Get(':id')              // עם ParseIntPipe
  @Post()                  // עם @Body()
  @Patch(':id')            // עם @Param() ו-@Body()
  @Delete(':id')           // עם @HttpCode(204)
}
```

**חשוב:**
- כל endpoint עם decorators נכונים
- ParseIntPipe על :id
- @Query() על filterDto
- @Body() על DTOs

---

### 7️⃣ **Guard - API Key**

**api-key.guard.ts:**

```typescript
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    
    if (apiKey === 'secret123') {
      return true;
    }
    
    throw new UnauthorizedException('API Key לא תקין');
  }
}
```

---

### 8️⃣ **Interceptors**

**logging.interceptor.ts:**
- לוג → GET /tasks לפני הrequest
- לוג ← GET /tasks - [duration]ms אחרי
- השתמש ב-tap() מ-rxjs

**transform.interceptor.ts:**
- עטוף את כל response ב:
```typescript
{
  success: true,
  data: [original response],
  timestamp: "ISO string"
}
```
- השתמש ב-map() מ-rxjs

---

### 9️⃣ **main.ts - הוסף ValidationPipe**

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
}));
```

---

## ⚠️ דרישות חשובות

### Validation:
- ✅ כל DTO עם decorators מ-class-validator
- ✅ הודעות שגיאה בעברית
- ✅ @IsOptional() על filter fields
- ✅ @IsEnum() עם ה-enum האמיתי (לא string)

### Error Handling:
- ✅ NotFoundException אם task לא קיים
- ✅ UnauthorizedException אם אין API Key
- ✅ ValidationPipe יזרוק BadRequestException אוטומטית

### Code Quality:
- ✅ TypeScript strict mode
- ✅ הערות בעברית בקוד
- ✅ שמות משתנים descriptive
- ✅ קוד נקי וקריא

### Filtering:
- ✅ GET /tasks → כל המשימות
- ✅ GET /tasks?status=OPEN → רק פתוחות
- ✅ GET /tasks?priority=HIGH → רק גבוהות
- ✅ GET /tasks?status=OPEN&priority=HIGH → שניהם

---

## 🧪 Testing Checklist

אחרי שמסיים - ודא ש:
- [ ] npm run start:dev עובד
- [ ] Swagger זמין ב-/api
- [ ] כל 5 endpoints עובדים
- [ ] Validation עובד (תנסה title ריק)
- [ ] Filtering עובד (נסה כל combination)
- [ ] Guard עובד (ללא header → 401)
- [ ] Logging רואים בקונסול
- [ ] Transform wrapper בתשובה

---

## 📋 Swagger Configuration

וודא ש-main.ts כולל:
```typescript
const config = new DocumentBuilder()
  .setTitle('Tasks API')
  .setDescription('Tasks Management API for Bootcamp')
  .setVersion('1.0')
  .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

---

## 💡 Tips למימוש

1. **סדר העבודה:**
   - Enums → Interface → DTOs → Service → Controller → Guard → Interceptors → main.ts

2. **Imports:**
   - וודא שכל import path נכון
   - לא לשכוח @nestjs/common decorators
   - class-validator decorators

3. **Testing תוך כדי:**
   - אחרי כל שלב - תריץ ותבדוק
   - השתמש ב-Swagger לבדיקות

4. **Common Mistakes:**
   - לא לשכוח ? על optional fields
   - לא לשכוח @IsOptional() על filter
   - Guard צריך להיות מיובא ב-Controller
   - Interceptors בסדר הנכון

---

## 🎯 Success Criteria

הפרויקט מוכן כאשר:
✅ כל הקבצים קיימים במבנה הנכון
✅ הקוד compile בלי שגיאות
✅ השרת עולה ורץ
✅ Swagger פועל
✅ כל ה-endpoints עובדים
✅ Validation, Guard, Interceptors פועלים

---

## 📝 לבסוף

תיצור לי:
1. ✅ כל הקבצים החסרים
2. ✅ תעדכן קבצים קיימים
3. ✅ תודיע לי מה נוצר/עודכן
4. ✅ תריץ בדיקה בסיסית

**תתחיל עכשיו!** 🚀