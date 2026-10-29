export const demoMovements = [
 {id:'m1',type:'income',concept:'Venta mostrador',category:'Ventas',amount:4850,date:'2026-10-29',invoice:'F-0081',method:'Transferencia'},
 {id:'m2',type:'expense',concept:'Compra de chocolate',category:'Materia prima',amount:1270,date:'2026-10-29',invoice:'A-0318',method:'Débito'},
 {id:'m3',type:'income',concept:'Torta personalizada',category:'Pedidos',amount:6900,date:'2026-10-28',invoice:'F-0080',method:'Efectivo'},
 {id:'m4',type:'expense',concept:'Servicio eléctrico',category:'Servicios',amount:2480,date:'2026-10-27',invoice:'UTE-1026',method:'Transferencia'},
 {id:'m5',type:'income',concept:'Caja de alfajores',category:'Ventas',amount:2150,date:'2026-10-26',invoice:'F-0079',method:'Efectivo'}
];
export const demoIngredients = [
 {id:'i1',name:'Harina 0000',unit:'g',stock:8200,min:2000,cost:0.052,expiry:'2026-12-12'},
 {id:'i2',name:'Azúcar',unit:'g',stock:4600,min:1500,cost:0.061,expiry:'2027-02-10'},
 {id:'i3',name:'Manteca',unit:'g',stock:750,min:1000,cost:0.39,expiry:'2026-11-04'},
 {id:'i4',name:'Huevos',unit:'un',stock:34,min:24,cost:18,expiry:'2026-11-02'},
 {id:'i5',name:'Limón',unit:'g',stock:1250,min:500,cost:0.22,expiry:'2026-11-07'}
];
export const demoRecipes = [
 {id:'r1',name:'Lemon pie individual',yield:8,price:260,labor:180,overhead:8,margin:55,ingredients:[{id:'i1',qty:240},{id:'i2',qty:180},{id:'i5',qty:300},{id:'i4',qty:3}]},
 {id:'r2',name:'Torta Chajá',yield:12,price:950,labor:420,overhead:10,margin:60,ingredients:[{id:'i1',qty:360},{id:'i2',qty:240},{id:'i4',qty:6}]},
 {id:'r3',name:'Alfajores de maicena',yield:20,price:95,labor:250,overhead:7,margin:50,ingredients:[{id:'i2',qty:200},{id:'i4',qty:2}]}
];
export const incomeCategories=['Ventas','Pedidos','Señas de clientes','Servicios','Otros ingresos'];
export const expenseCategories=['Materia prima','Packaging','Servicios','Alquiler','Sueldos','Equipamiento','Marketing','Impuestos','Transporte','Otros gastos'];