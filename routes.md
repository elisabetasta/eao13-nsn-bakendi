Routes fyrir venjulegan user
/events [GET] listi af events KOMIÐ
/events/:slug [GET] eitt event
/events/:slug/registrations [GET, POST] hverjir eru skráðir á viðburð og að skrá sig á viðburð
/events/:slug/registrations/:userSlug [GET, DELETE] athuga hvort ákveðinn user (með userSlug) er skráður, og afskrá sig sjálfan
/events/:slug/speaker [GET] hver er að tala á viðburði
/users/register [POST] búa til nýjan notenda
/users/login [POST] skrá sig inn

Routes fyrir admin
/events [GET, POST] listi af events GET KOMIÐ, VANTAR AÐ VALIDATA POST ÞANNIG BARA ADMIN GETI, ANNARS ER POST KOMIÐ FYRIR ALMENNAN NOTANDA (SEM Á SAMT EKKI AÐ VERA)
/events/:slug [GET, PATCH, DELETE] eitt event
/events/:slug/registrations [GET, POST] hverjir eru skráðir á viðburð og að skrá sig á viðburð
/events/:slug/registrations/:userSlug [GET, DELETE] athuga hvort ákveðinn user (með userSlug) er skráður, og afskrá sig sjálfan OG afskráð aðra
/events/:slug/speaker [GET, POST, PATCH, DELETE] hver er að tala á viðburði
/users [GET] sækja alla notendur
/users/register [POST] búa til nýjan notenda (getur búið til notenda, venjulegan og admin)
/users/login [POST] skrá sig inn
