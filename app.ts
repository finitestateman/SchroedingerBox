type Alive<T> = (value: T) => void;
type Dead = (reason: any) => void;

class SchroedingersBox<T> implements Promise<T> {
  private promise: Promise<T>;

  constructor(experiment: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    this.promise = new Promise(experiment);
  }

  then<TResult1 = T, TResult2 = never>(
    ifAlive?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    ifDead?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(ifAlive, ifDead);
  }

  catch<TResult = never>(
    ifDead?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined
  ): Promise<T | TResult> {
    return this.promise.catch(ifDead);
  }

  [Symbol.toStringTag]: string = 'SchroedingersBox';

  public ifAlive<TResult1 = T, TResult2 = never>(
    ifAlive?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    ifDead?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): SchroedingersBox<TResult1 | TResult2> {
    console.log("Handling onAlive");
    return new SchroedingersBox<TResult1 | TResult2>((resolve, reject) => {
      this.promise.then(ifAlive, ifDead).then(resolve, reject);
    });
  }

  public ifDead<TResult = never>(
    ifDead?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): SchroedingersBox<T | TResult> {
    console.log("Handling onDead");
    return new SchroedingersBox<T | TResult>((resolve, reject) => {
      this.promise.catch(ifDead).then(resolve, reject);
    });
  }
}

// 동물 상태 실험
const animalExperiment = (animalName: string, result: string): SchroedingersBox<string> => {
  return new SchroedingersBox<string>((resolve, reject) => {
    const isAnimalAlive = Math.random() > 0.5; // 50% 확률로 동물 상태 결정

    setTimeout(() => {
      if (isAnimalAlive) {
        resolve(result);
      } else {
        reject(`${animalName}가 죽었습니다...`);
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
  .ifAlive((result: string) => console.log(result))
  .ifDead((error: any) => console.error(error));

tigerPromise
  .ifAlive((result: string) => console.log(result))
  .ifDead((error: any) => console.error(error));

leopardPromise
  .ifAlive((result: string) => console.log(result))
  .ifDead((error: any) => console.error(error));

// 사용 예시
const box = animalExperiment("고양이", "고양이가 살아있습니다.");
box.ifAlive(result => console.log(result), (error: any) => console.log(error));
box
  .ifAlive(result => console.log(result))
  .ifDead((error: any) => console.error(error));

async function test() {
  try {
    const dogBox = await animalExperiment("강아지", "강아지가 살아습니다.");
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
