## Hópverkefni 1 í vefforritun 2

Unnið var áfram með viðburðakerfið

### Unnið af

- Ástríður Haraldsdóttir Passauer [ahp9@hi.is](mailto:ahp9@hi.is)
- Bjarki Sigurjónsson Thorarenssen [bjs84@hi.is](mailto:bjs84@hi.is)
- Elísabet Ásta Ólafsdóttir [eao13@hi.is](mailto:eao13@hi.is)
- Ívan Már Þrastarson [imt1@hi.is](mailto:imt1@hi.is)

### Til að byrja verkefni þarf að:

```
createdb vef2-2023-h1
npm install
npm run setup
npm run start
```

### Til að keyra test

Það vannst ekki tími til að útbúa að test gögnum sé eytt þannig að

- Í hvert sinn sem keyra skal test þarf að keyra á skipanalínu
  `npm run setup`
  `npm run start` 
  og síðan
  `npm run test`. 
ATH það þarf að keyra npm run test 6 SINNUM vegna þess að notendur 1 til 5 eru nú þegar til í gagnagrunninum.  
Ekki vannst tími til að laga þetta núna en það verður gert í framtíðinni.  

### Admin notandi er
{
  "username": "admin",
  "password": "123"
 }
 
 Hægt að logga inn með POST á /users/login
