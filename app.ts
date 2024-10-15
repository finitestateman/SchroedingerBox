type Alive<T> = (value: T) => void;
type Dead = (reason: any) => void;

class SchroedingersBox<T> extends Promise<T> {
  constructor(experiment: (resolve: (value: T) => void, reject: (reason?: any) => void) => void) {
    super(experiment);
  }

  public ifAlive<TResult1 = T, TResult2 = never>(
    ifAlive?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    ifDead?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): SchroedingersBox<TResult1 | TResult2> {
    // Custom logic for onAlive
    console.log("Handling onAlive");
    return new SchroedingersBox<TResult1 | TResult2>((resolve, reject) => {
      super.then(ifAlive, ifDead).then(resolve, reject);
    });
  }

  public ifDead<TResult = never>(
    ifDead?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): SchroedingersBox<T | TResult> {
    // Custom logic for onDead
    console.log("Handling onDead");
    return new SchroedingersBox<T | TResult>((resolve, reject) => {
      super.catch(ifDead).then(resolve, reject);
    });
  }
}

// 동물 상태 실험
const animalExperiment = (animalName: string, result: string): SchroedingersBox<string> => {
  return new SchroedingersBox<string>((resolve, reject) => {
    const isAnimalAlive = Math.random() > 0.5; // 50% 확률로 동물 상태 결정

    setTimeout(() => {
      if (isAnimalAlive) {
        resolve(result); // resolve 호출
      } else {
        reject(`${animalName}가 죽었습니다...`); // reject 호출
      }
    }, 1000); // 1초 후에 상태 결정
  });
};

// 사자, 호랑이, 표범 상태 확인
const lionPromise = animalExperiment('사자', '사자가 살아있습니다!');
const tigerPromise = animalExperiment('호랑이', '호랑이가 살아있습니다!');
const leopardPromise = animalExperiment('표범', '표범이 살아있습니다!');

// 각 Promise 결과 처리
lionPromise
  .then(result => console.log(result))
  .catch(error => console.error(error));

tigerPromise
  .then(result => console.log(result))
  .catch(error => console.error(error));

leopardPromise
  .then(result => console.log(result))
  .catch(error => console.error(error));

// 사용 예시
const box = animalExperiment("고양이", "고양이가 살아있습니다.");
box.ifAlive(result => console.log(result), error => console.log(error));
box
  .ifAlive(result => console.log(result))
  .ifDead(error => console.error(error));

async function test() {
  try {
    const dogBox = await animalExperiment("강아지", "강아지가 살아있습니다.");
    console.log(dogBox);
  } catch (error) {
    console.error(error); // Handle the rejection here
  }
}
test();
// box.openBox(
//   result => console.log(result),
//   error => console.log(error)
// );
