# ZokalGoogleSheetAPI

Makes REST endpoint for your Google Sheet with help of Google Sheet API v4.

Assumes the first row as keys of your data as pretty much how it is presented in tables and databases.

## Google Sheet

Link: https://docs.google.com/spreadsheets/d/1iei9eSwKRK8bq8jP8ybb_lf7GraDNW0uSaooFclbPkA/

### Sheet1

![Sheet1 Screenshot](https://raw.githubusercontent.com/webriq/zokalgooglesheetsapi/develop/public/img/screenshots/Sheet1.png)

![Sheet1 JSON](https://raw.githubusercontent.com/webriq/zokalgooglesheetsapi/develop/public/img/screenshots/Sheet1JSON.png)

### Sheet4

![Sheet4 Screenshot](https://raw.githubusercontent.com/webriq/zokalgooglesheetsapi/develop/public/img/screenshots/Sheet4.png)

![Sheet4 JSON](https://raw.githubusercontent.com/webriq/zokalgooglesheetsapi/develop/public/img/screenshots/Sheet4JSON.png)

## Usage

#### Retrieve data (default sheet)

`GET /sheet`

Response:

```json
[
	{
		"id": "3",
		"name": "Mary",
		"score": "90"
	},
	{
		"id": "4",
		"name": "Levi",
		"score": "86"
	}
]
```

#### Retrieve data from other sheet

Just pass `sheetTitle` as parameter and name of sheet as value

`GET /sheet?sheetTitle=Sheet4`

Response:

```json
[
	{
		"id": "1",
		"email": "dsaf@gmail.com",
		"firstname": "Jun",
		"lastname": "Eleazar"
	},
	{
		"id": "3",
		"email": "galangdj@gmail.com",
		"firstname": "Dorell",
		"lastname": "James"
	}
]
```

---

#### Add new data (default sheet)

`POST /sheet`

Body:

Data to be passed is based on columns as keys and whatever value you put in.

```json
{
	"id": 1,
	"name": "John",
	"score": 80
}
```

Response:

```json
[
	{
		"id": "3",
		"name": "Mary",
		"score": "90"
	},
	{
		"id": "4",
		"name": "Levi",
		"score": "86"
	},
	{
		"id": 1,
		"name": "John",
		"score": 80
	}
]
```

#### Add new data (other sheet)

Just pass `sheetTitle` as parameter and name of sheet as value

`POST /sheet?sheetTitle=Sheet4`

Body:

Data to be passed is based on columns as keys and whatever value you put in.

```json
{
	"id": "2",
	"email": "doe@gmail.com",
	"firstname": "Doe",
	"lastname": "Bread"
}
```

Response:

```json
[
	{
		"id": "1",
		"email": "dsaf@gmail.com",
		"firstname": "Jun",
		"lastname": "Eleazar"
	},
	{
		"id": "3",
		"email": "galangdj@gmail.com",
		"firstname": "Dorell",
		"lastname": "James"
	},
	{
		"id": "2",
		"email": "doe@gmail.com",
		"firstname": "Doe",
		"lastname": "Bread"
	}
]
```

---

#### Update row data by matching column and row value (default sheet)

Just pass `sheetTitle` as parameter and name of sheet as value

`PUT /sheet/:columnValue/:rowValue`

From data below:

```json
[
	{
		"id": "3",
		"name": "Mary",
		"score": "90"
	},
	{
		"id": "4",
		"name": "Levi",
		"score": "86"
	},
	{
		"id": 1,
		"name": "John",
		"score": 80
	}
]
```

Example: `PUT /sheet/id/1`

Body:

Data to be passed is based on columns as keys and whatever value you put in.

```json
{
	"id": 1,
	"name": "Max",
	"score": 100
}
```

Response:

```json
[
	{
		"id": "3",
		"name": "Mary",
		"score": "90"
	},
	{
		"id": "4",
		"name": "Levi",
		"score": "86"
	},
	{
		"id": 1,
		"name": "Max",
		"score": 100
	}
]
```

#### Update row data by matching column and row value (other sheet)

`PUT /sheet/:columnValue/:rowValue?sheetTitle=:sheetName`

From:

```json
[
	{
		"id": "1",
		"email": "dsaf@gmail.com",
		"firstname": "Jun",
		"lastname": "Eleazar"
	},
	{
		"id": "3",
		"email": "galangdj@gmail.com",
		"firstname": "Dorell",
		"lastname": "James"
	},
	{
		"id": "2",
		"email": "doe@gmail.com",
		"firstname": "Doe",
		"lastname": "Bread"
	}
]
```

Example: `PUT /sheet/id/1?sheetTitle=Sheet4`

Body:

Data to be passed is based on columns as keys and whatever value you put in.

```json
{
	"id": "2",
	"email": "mary@gmail.com",
	"firstname": "Mary",
	"lastname": "Me"
}
```

Response:

```json
[
	{
		"id": "1",
		"email": "dsaf@gmail.com",
		"firstname": "Jun",
		"lastname": "Eleazar"
	},
	{
		"id": "3",
		"email": "galangdj@gmail.com",
		"firstname": "Dorell",
		"lastname": "James"
	},
	{
		"id": "2",
		"email": "mary@gmail.com",
		"firstname": "Mary",
		"lastname": "Me"
	}
]
```

---

#### Delete row data by matching column and row value (default sheet)

Just pass `sheetTitle` as parameter and name of sheet as value

`DELETE /sheet/:columnValue/:rowValue`

From data below:

```json
[
	{
		"id": "3",
		"name": "Mary",
		"score": "90"
	},
	{
		"id": "4",
		"name": "Levi",
		"score": "86"
	},
	{
		"id": 1,
		"name": "John",
		"score": 80
	}
]
```

Example: `DELETE /sheet/id/4`

Response:

```json
[
	{
		"id": "3",
		"name": "Mary",
		"score": "90"
	},
	{
		"id": 1,
		"name": "John",
		"score": 80
	}
]
```

#### Delete row data by matching column and row value (other sheet)

Optional last argument is the sheet name.

`DELETE /sheet/:columnValue/:rowValue/:sheetTitle?`

From:

```json
[
	{
		"id": "1",
		"email": "dsaf@gmail.com",
		"firstname": "Jun",
		"lastname": "Eleazar"
	},
	{
		"id": "3",
		"email": "galangdj@gmail.com",
		"firstname": "Dorell",
		"lastname": "James"
	},
	{
		"id": "2",
		"email": "mary@gmail.com",
		"firstname": "Mary",
		"lastname": "Me"
	}
]
```

Example: `DELETE /sheet/id/1/Sheet4`

Response:

```json
[
	{
		"id": "3",
		"email": "galangdj@gmail.com",
		"firstname": "Dorell",
		"lastname": "James"
	},
	{
		"id": "2",
		"email": "mary@gmail.com",
		"firstname": "Mary",
		"lastname": "Me"
	}
]
```
