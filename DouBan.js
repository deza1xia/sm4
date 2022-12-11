Aug Azed, [2022/12/11 15:42]
/**************************

哔哩哔哩, 港澳台番剧自动切换地区 & 显示豆瓣评分

如需禁用豆瓣评分或策略通知, 可前往BoxJs设置.
BoxJs订阅地址: https://raw.githubusercontent.com/NobyDa/Script/master/NobyDa_BoxJs.json

Update: 2022.08.01
Author: @NobyDa
Use: Surge, QuanX, Loon

************************
港澳台自动切换地区说明 :
************************

地区自动切换功能仅适用于Surge4.7+(iOS)，Loon2.1.10(286)+，QuanX1.0.22(543)+
低于以上版本仅显示豆瓣评分.

您需要配置相关规则集:
Surge、Loon: 
https://raw.githubusercontent.com/NobyDa/Script/master/Surge/Bilibili.list

QuanX: 
https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/Bilibili.list

绑定相关select或static策略组，并且需要具有相关的区域代理服务器纳入您的子策略中，子策略可以是服务器也可以是其他区域策略组．
最后，您可以通过BoxJs设置策略名和子策略名，或者手动填入脚本.

如需搜索指定地区番剧, 可在搜索框添加后缀" 港", " 台", " 中". 例如: 进击的巨人 港

QX用户注: 使用切换地区功能请确保您的QX=>其他设置=>温和策略机制处于关闭状态, 以及填写策略名和子策略名时注意大小写.

************************
Surge 4.7+ 远程脚本配置 :
************************
[Script]
Bili Region = type=http-response,pattern=^https:\/\/ap(p|i)\.bili(bili|api)\.(com|net)\/(pgc\/view\/v\d\/app\/season|x\/offline\/version)\?,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Bili_Auto_Regions.js

#可选, 适用于搜索指定地区的番剧
Bili Search = type=http-request,pattern=^https:\/\/ap(p|i)\.bili(bili|api)\.(com|net)\/x\/v\d\/search(\/type)?\?.+?%20(%E6%B8%AF|%E5%8F%B0|%E4%B8%AD)&,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Bili_Auto_Regions.js

[MITM]
hostname = ap?.bili*i.com, ap?.bili*i.net

************************
Quantumult X 远程脚本配置 :
************************
[rewrite_local]
^https:\/\/ap(p|i)\.bili(bili|api)\.(com|net)\/(pgc\/view\/v\d\/app\/season|x\/offline\/version)\? url script-response-body https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Bili_Auto_Regions.js

#可选, 适用于搜索指定地区的番剧
^https:\/\/ap(p|i)\.bili(bili|api)\.(com|net)\/x\/v\d\/search(\/type)?\?.+?%20(%E6%B8%AF|%E5%8F%B0|%E4%B8%AD)& url script-request-header https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Bili_Auto_Regions.js

[mitm]
hostname = ap?.bili*i.com, ap?.bili*i.net

[filter_local]
#可选, 由于qx纯tun特性, 不添加规则可能会导致脚本失效. https://github.com/NobyDa/Script/issues/382
ip-cidr, 203.107.1.1/24, reject

************************
Loon 远程脚本配置 :
************************
[Script]
http-response ^https:\/\/ap(p|i)\.bili(bili|api)\.(com|net)\/(pgc\/view\/v\d\/app\/season|x\/offline\/version)\? script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Bili_Auto_Regions.js, requires-body=true, tag=bili自动地区

#可选, 适用于搜索指定地区的番剧
http-request ^https:\/\/ap(p|i)\.bili(bili|api)\.(com|net)\/x\/v\d\/search(\/type)?\?.+?%20(%E6%B8%AF|%E5%8F%B0|%E4%B8%AD)& script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Bili_Auto_Regions.js, tag=bili自动地区(搜索)

[Mitm]
hostname = ap?.bili*i.com, ap?.bili*i.net

***************************/

let $ = nobyda();
let run = EnvInfo();

async function QueryRating(body, play) {
 try {
  const ratingEnabled = $.read('BiliDoubanRating') === 'false';
  if (!ratingEnabled && play.title && body.data && body.data.badge_info) {
   const [t1, t2] = await Promise.all([
    GetRawInfo(play.title.replace(/\uff08[\u4e00-\u9fa5]+\u5340\uff09/, '')),
    GetRawInfo(play.origin_name)
   ]);
   const exYear = body.data.publish.release_date_show.split(/^(\d{4})/)[1];
   const info1 = (play.staff && play.staff.info) || '';
   const info2 = (play.actor && play.actor.info) || '';
   const info3 = (play.celebrity && play.celebrity.map(n => n.name).join('/')) || '';
   const filterInfo = [play.title, play.origin_name, info1 + info2 + info3, exYear];
   const [rating, folk, name, id, other] = ExtractMovieInfo([...t1, ...t2], filterInfo);
   const limit = JSON.stringify(body.data.modules)
    .replace(/"\u53d7\u9650"/g, `""`).replace(/("area_limit":)1/g, '$10');
   body.data.modules = JSON.parse(limit);
   body.data.detail = body.data.new_ep.desc.replace(/连载中,/, '');
   body.data.badge_info.text = ⭐️ 豆瓣：${!$.is403 ? `${rating || '无评'}分 (${folk || '无评价'}) : 查询频繁！`};
   body.data.evaluate = ${body.data.evaluate || ''}\n\n豆瓣评分搜索结果: ${JSON.stringify(other, 0, 1)};
   body.data.

Aug Azed, [2022/12/11 15:42]
new_ep.desc = name;
   body.data.styles.unshift({
    name: "⭐️ 点击此处打开豆瓣剧集详情页",
    url: https://m.douban.com/${id ? `movie/subject/${id}/ : search/?query=${encodeURI(play.title)}`}
   });
  }
 } catch (err) {
  console.log(`Douban rating: \n${err}\n`);
 } finally {
  $done({
   body: JSON.stringify(body)
  });
 }
}

function ExtractMovieInfo(ret, fv) {
 const sole = new Set(ret.map(s => JSON.stringify(s))); //delete duplicate
 const f1 = [...sole].map(p => JSON.parse(p))
  .filter(t => {
   t.accuracy = 0;
   if (t.name && fv[0]) { //title
    if (t.name.includes(fv[0].slice(0, 4))) t.accuracy++;
    if (t.name.includes(fv[0].slice(-3))) t.accuracy++;
   }
   if (t.origin && fv[1]) { //origin title
    if (t.origin.includes(fv[1].slice(0, 4))) t.accuracy++;
    if (t.origin.includes(fv[1].slice(-3))) t.accuracy++;
   }
   if (t.pd && fv[2]) { //producer or actor
    const len = t.pd.split('/').filter(c => fv[2].includes(c));
    t.accuracy += len.length;
   }
   if (t.year && fv[3] && t.year == fv[3]) t.accuracy++; //year
   return Boolean(t.accuracy);
  });
 let x = {}; //assign most similar
 const f2 = f1.reduce((p, c) => c.accuracy > p ? (x = c, c.accuracy) : p, 0);
 return [x.rating, x.folk, x.name, x.id, f1];
}

function GetRawInfo(t) {
 let res = [];
 let st = Date.now();
 return new Promise((resolve) => {
  if (!t) return resolve(res);
  $.get({
   url: https://www.douban.com/search?cat=1002&q=${encodeURIComponent(t)},
   headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    'Cookie': JSON.stringify(st)
   }
  }, (error, resp, data) => {
   if (error) {
    console.log(`Douban rating: \n${t}\nRequest error: ${error}\n`);
   } else {
    if (/\u767b\u5f55<\/a>\u540e\u91cd\u8bd5\u3002/.test(data)) $.is403 = true;
    let s = data.replace(/\n| |&#\d{2}/g, '')
     .match(/\[(\u7535\u5f71|\u7535\u89c6\u5267)\].+?subject-cast\">.+?<\/span>/g) || [];
    for (let i = 0; i < s.length; i++) {
     res.push({
      name: s[i].split(/\}\)">(.+?)<\/a>/)[1],
      origin: s[i].split(/\u540d:(.+?)(\/|<)/)[1],
      pd: s[i].split(/\u539f\u540d.+?\/(.+?)\/\d+<\/span>$/)[1],
      rating: s[i].split(/">(\d\.\d)</)[1],
      folk: s[i].split(/(\d+\u4eba\u8bc4\u4ef7)/)[1],
      id: s[i].split(/sid:(\d+)/)[1],
      year: s[i].split(/(\d+)<\/span>$/)[1]
     })
    }
    let et = ((Date.now() - st) / 1000).toFixed(2);
    console.log(`Douban rating: \n${t}\n${res.length} movie info searched. (${et} s)\n`);
   }
   resolve(res);
  })
 })
}
