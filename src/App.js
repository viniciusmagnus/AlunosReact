import React, {useState, useEffect} from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Modal, ModalBody, ModlFooter, ModalHeader, ModalFooter} from 'reactstrap';
import logoCadastro from './assets/cadastro.png';

function App() {

  const baseUrl = "https://localhost:7030/api/alunos";

  const [data, setData]=useState([]);
  const [updateData, setupdateData]=useState(true);

  const [modalIncluir, setModalIncluir]=useState(false);
  const [modalEditar, setModalEditar]=useState(false);
  const [modalExcluir, setModalExcluir]=useState(false);

  const [alunoSelecionado , setAlunoSelecionado]=useState({
    id: '',
    nome:'',
    email:'',
    idade:'',   
  })

  const selecionarAluno = (aluno, opcao) => {
    setAlunoSelecionado(aluno);
    //se a opção for "Editar" ele chama a 
    //função para abrir o modal editar, caso 
    //seja um valor diferente, chama a função para abrir o modal excuir
    (opcao === "Editar") ?
    abrirFecharModalEditar() : abrirFecharModalExcluir();
  }

  //definindo o método para criar novo aluno
  const abrirFecharModalIncluir=()=>{
    setModalIncluir(!modalIncluir);
  }

  //definindo o método para editar o aluno
  const abrirFecharModalEditar=()=>{
    setModalEditar(!modalEditar);
  }

  //definindo o método para excluir o aluno
  const abrirFecharModalExcluir=()=>{
    setModalExcluir(!modalExcluir);
  }

  const handleChange = e=>{
    const {name,value} = e.target;
    setAlunoSelecionado({
      ...alunoSelecionado, [name]:value
    });
    console.log(alunoSelecionado);
  }

  const pedidoGet = async()=>{
      //await nesta função async para esperar a resposta da api, promise no final da função async
      await axios.get(baseUrl)
      .then(Response => {
        setData(Response.data)
      }).catch(error=>{
        console.log(error);
      })
  }

  const pedidoPost = async()=>{
    //deletando o valor do id, pois vai ser autoincrementado no db
    delete alunoSelecionado.id;
    // conversão de string pra int da idade do aluno
    alunoSelecionado.idade=parseInt(alunoSelecionado.idade);
    //usando o axios para fazer um post, passando a url e os dados do aluno selecionado
    await axios.post(baseUrl, alunoSelecionado)
    .then(Response => {
      setData(data.concat(Response.data));
      setupdateData(true);
      abrirFecharModalIncluir();
    }).catch(error=>{
      console.log(error);
    })
}

const pedidoPut=async()=>{
  //passando a idade para int
  alunoSelecionado.idade=parseInt(alunoSelecionado.idade);
  //montando o request passando o endpoint de cada aluno
  await axios.put(baseUrl+"/"+alunoSelecionado.id, alunoSelecionado)
  .then(response=>{
    //armazenando na variavel resposta, os dados da api para buscar mais facilmente
    var resposta = response.data;
    var dadosAuxiliar = data;
    //vai mapear os dados e verificar em cada registro quais foram alterados e quando encontrar vai efetivar as alterações
    dadosAuxiliar.map(aluno=>{
      if(aluno.id===alunoSelecionado.id){
        aluno.nome = resposta.nome;
        aluno.email = resposta.email;
        aluno.idade = resposta.idade;
      }
    });
    setupdateData(true);
    //fecha a janela modal
    abrirFecharModalEditar();
  }).catch(error=>{
    console.log(error);
  })
}

const pedidoDelete=async()=>{
  await axios.delete(baseUrl+"/"+alunoSelecionado.id)
  .then(response=>{
    //filtrando os dados e excluindo o aluno que coincide 
    //com o id passado pela api com operador de desigualdade 
    //estrita (verifica além do valor, o tipo de dado)
    setData(data.filter(aluno=> aluno.id !== response.data));
    setupdateData(true);
    abrirFecharModalExcluir();
  }).catch(error=>{
    console.log(error);
  })
}

  //O useEffect é usado para lidar 
  //com efeitos colaterais em componentes 
  //funcionais, como fazer uma chamada a 
  //uma API, manipular eventos do DOM ou 
  //realizar limpezas. Ele permite executar 
  //código em momentos específicos do ciclo 
  //de vida do componente, como após a montagem 
  //inicial, atualizações ou desmontagem.

  useEffect(()=>{
    //verifica se o valor é true, se for, chama o pedidoGet e atualiza updateData para falso
    if(updateData){
      pedidoGet();
      setupdateData(false);
    }
    //definindo que o useEffect será chamado com base no valor de updateData (toda vez que for atualizado, o useEffect vai atuar)
  },[updateData])
 
  return (
    <div className="aluno-container">
      <br/>
      <h3>Cadastro de alunos</h3>
      <header>
          <img src={logoCadastro} alt='Cadastro'/>
          <button className='btn btn-sucess' onClick={()=>abrirFecharModalIncluir()}>Incluir Novo Aluno</button>
      </header>
      <table className='table table-bordered' >
        <thead>
          <tr>
            <th>Id</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Idade</th>
            <th>Operação</th>
          </tr>
        </thead>
        <tbody>
        {data.map(aluno => (
            <tr key={aluno.id}>
              <td>{aluno.id}</td>
              <td>{aluno.nome}</td>
              <td>{aluno.email}</td>
              <td>{aluno.idade}</td>
              <td>
                <button className="btn btn-primary" onClick={()=>selecionarAluno(aluno, "Editar")}>Editar</button> {"  "}
                <button className="btn btn-danger"onClick={()=>selecionarAluno(aluno, "Excluir")}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={modalIncluir}>
        <ModalHeader>Incluir Alunos</ModalHeader>
          <ModalBody>
              <div className="form-group">
                <label>Nome:</label>
                <br/>
                <input type="text" className="form-control" name="nome" onChange={handleChange}></input>
                <br/>
                <label>Email:</label>
                <br/>
                <input type="text" className="form-control" name="email" onChange={handleChange}></input>
                <br/>
                <label>Idade:</label>
                <br/>
                <input type="text" className="form-control" name="idade" onChange={handleChange}></input>
                <br/>
              </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-primary" onClick={()=>pedidoPost()}>Incluir</button>{"  "}
            <button className="btn btn-danger" onClick={()=>abrirFecharModalIncluir()}>Cancelar</button>
          </ModalFooter>
      </Modal>

      <Modal isOpen={modalEditar}>
        <ModalHeader>Editar aluno</ModalHeader>
        <ModalBody>
          <div className="form-group">
            <label>ID: </label><br />
            <input type="text" className="form-control" readOnly value={alunoSelecionado && alunoSelecionado.id}></input><br />
            <label>Nome:</label><br/>
            <input type="text" className="form-control" name="nome" onChange={handleChange} value={alunoSelecionado && alunoSelecionado.nome}></input>
            <label>Email:</label><br/>
            <input type="text" className="form-control" name="email" onChange={handleChange}  value={alunoSelecionado && alunoSelecionado.email}></input>
            <label>Idade:</label><br/>
            <input type="text" className="form-control" name="idade" onChange={handleChange}  value={alunoSelecionado && alunoSelecionado.idade}></input>
          </div>
        </ModalBody>
        <ModalFooter>
        <button className="btn btn-primary" onClick={()=>pedidoPut()}>Editar</button>{"  "}
        <button className="btn btn-danger" onClick={()=>abrirFecharModalEditar()}>Cancelar</button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={modalExcluir}>
        <ModalBody>
          Confirma a exclusão deste(a) aluno(a) : {alunoSelecionado && alunoSelecionado.nome} ?
        </ModalBody>
        <ModalFooter>
        <button className="btn btn-primary" onClick={()=>pedidoDelete()}>Sim</button>
        <button className="btn btn-danger" onClick={()=>abrirFecharModalExcluir()}>Não</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default App;
