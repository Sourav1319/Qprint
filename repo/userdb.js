const fs=require('fs');
const crypto=require('crypto');

var currentdate = new Date(); 
var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();

class userdb{
	constructor(filename){

		this.filename=filename;

		try{
			fs.accessSync(this.filename)
		}catch(err){
			fs.writeFileSync(this.filename,'[]');
		}
	}
	async getAll(){
		return JSON.parse(await fs.promises.readFile(this.filename,{
			encoding:'utf8'
		}))
	}
	async writeAll(records){
		await fs.promises.writeFile(this.filename,JSON.stringify(records,null,2));
	}
	async create(id,username){
		const records=await this.getAll();
		const newentry={
			id:id,
			username:username,
			links:[]
		}
		records.push(newentry);
		await this.writeAll(records);
		return newentry;
	}
	async pushdata(id,data){
		data.date=datetime;
		const records=await this.getAll();
		for(let record of records){
			if(record.id===id){
				record.links.push(data);
				break;
			}
		}
		await this.writeAll(records);
	}

	async delete(id,data){
		const records=await this.getAll();
		for(let record of records){
			if(record.id===id){
				const nu=[];
				for(let entry of record.links){
					if(entry.link!=data.link){
						nu.push(entry);
					}
				}
				record.links=nu;
			}
		}
		await this.writeAll(records);
	}
	async getById(id){
		const records=await this.getAll();
		for(let record of records){
			if(record.id==id){
				return record;
			}
		}
	}
	async edit(id,org,data){
		const records=await this.getAll();
		for(let record of records){
			if(record.id===id){
				let i=0;
				for(let obj of record.links){
					if(obj.link===org.link){
						record.links[i].title=data.title;
						record.links[i].link=data.link;
						await this.writeAll(records);
						return;
					}
					i++;
				}
			}
		}
		await this.writeAll(records);
	}
	async admindelete(data){
		const records=await this.getAll();
		// console.log(data);
		for(let record of records){
			const nu=[];
			for(let entry of record.links){
				if(entry.link!==data.link){
					nu.push(entry);
				}
			}
			record.links=nu;
		}
		await this.writeAll(records);
	}
}

module.exports=new userdb('userdb.json');